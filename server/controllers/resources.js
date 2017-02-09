"use strict";

var express     = require('express'),
	passport    = require('../authentication/passport'),
	AccessToken = require('../models/authentication/access-token'),
	Client      = require('../models/authentication/client'),
	User        = require('../models/authentication/user'),
	Indicator   = require('../models/resources/indicator'),
	Input       = require('../models/resources/input'),
	Project     = require('../models/resources/project'),
	Theme       = require('../models/resources/theme');

var bodyParser = require('body-parser').json();



module.exports = express.Router()

	/**
	 * FIXME => this middleware should be in another file and included in app.js
	 * Check that user is properly authenticated with a cookie.
	 * and that it's really a user, not a client that found a way to get a cookie.
	 */
	.use(function(request, response, next) {
		if (request.isAuthenticated && request.isAuthenticated() && request.user && (request.user.type === 'user' || request.user.type === 'partner'))
			next();
		else {
			passport.authenticate('user_accesstoken', {session: false}, function(error, user, info) {
				// FIXME: not sure what this does 2 years after, only real users can have accesstokens?
				if (user && user.type === 'user') {
					request.user = user;
					next();
				}
				else
					response.status(401).json({
						error: "credentials_required",
						message: "Please provide either session cookie or an access token."
					});
			})(request, response, next);
		}
	})

	/**
	 * Get current logged in account information
	 * This is used by the client to check if current session is valid and learn user name for display purposes.
	 */
	.get('/myself', function(request, response) {
		response.json(request.user || null);
	})

	/**
	 * Retrieve multiple projects.
	 *
	 * Multiple modes are supported
	 * 		- no parameter: Retrieve all projects.
	 *		- ?mode=short: Retrieve all projects (only country, name, themes, and current user).
	 *		- ?mode=crossCutting&indicatorId=123: Retrieve projects that collect indicator 123 (bare minimum to compute indicator from cubes).
	 */
	.get('/project', function(request, response) {
		var promise;
		if (request.user.type === 'user' && request.query.mode === 'short')
			promise = Project.storeInstance.listShort(request.user._id);

		else {
			if (request.query.mode === 'crossCutting')
				promise = Project.storeInstance.listByIndicator(request.query.indicatorId, true);
			else if (request.query.mode === undefined)
				promise = Project.storeInstance.list();
			else
				promise = Promise.reject(new Error('invalid_mode'));
			
			// Filter projects for partners.
			if (request.user.type === 'partner')
				promise = promise.then(projects => projects.filter(p => p._id === request.user.projectId));

			// listShort, listByIndicator and list require a post processing step
			// to hide passwords (which is not the case for listShort)
			promise = promise.then(projects => projects.map(p => p.toAPI()))
		}

		promise.then(response.jsonPB, response.jsonErrorPB);
	})

	/**
	 * Retrieve one project
	 */
	.get('/project/:id', function(request, response) {
		if (request.user.type == 'partner' && request.params.id !== request.user.projectId)
			return response.jsonError(new Error('forbidden'));
		
		Project.storeInstance.get(request.params.id)
			.then(p => p.toAPI())
			.then(response.jsonPB, response.jsonErrorPB);
	})

	/**
	 * Save a project
	 */
	.put('/project/:id', bodyParser, function(request, response) {
		// Validate that the _id in the payload is the same as the id in the URL.
		if (request.body._id !== request.params.id)
			return response.jsonError(new Error('id_mismatch'));

		// Get old project to check ACLs
		Project.storeInstance.get(request.params.id)
			.then(
				// project was found, we raise an error if user is not allowed, otherwise we return the project.
				function(project) {
					if ('owner' !== project.getRole(request.user))
						throw new Error('forbidden');
				},
				// project was not found, we check if user can create projects, and raise error otherwise
				// if the error was something else, reraise it.
				function(error) {
					var u = request.user;
					if (error.message === 'missing' && !(u.type === 'user' && (u.role === 'admin' || u.role === 'project')))
						throw new Error('forbidden'); // Cannot create project
					else if (error.message !== 'missing')
						throw error; // any other database error.
				}
			)
			.then(function() {
				return new Project(request.body).save();
			})
			.then(p => p.toAPI())
			.then(response.jsonPB, response.jsonErrorPB);
	})

	/**
	 * Delete a project
	 */
	.delete('/project/:id', function(request, response) {
		// Partners cannot delete projects (that would be deleting themselves).
		if (request.user.type !== 'user')
			return response.jsonError(new Error('forbidden'));
		
		Project.storeInstance.get(request.params.id).then(function(project) {
			// Ask the project if it is deletable.
			if (project.getRole(request.user) !== 'owner')
				throw new Error("forbidden");

			return project.destroy();
		}).then(response.jsonPB, response.jsonErrorPB);
	})

	/**
	 * Retrieve a list of inputs, or inputs ids.
	 * 
	 * Multiple modes are supported
	 * 		- ids_by_form: retrieve all input ids that match a given projectId and formId
	 *		- ids_by_entity: retrieve all inputs ids that match a given projectId and entityId
	 * 		- current+last: retrieve a given input and the previous one (with projectId, formId, entityId & period)
	 */
	.get('/input', function(request, response) {
		var promise, q = request.query;

		// If user is a partner, force him to have a projectId filter.
		if (request.user.type === 'partner') {
			// User if trying to access forbidden ressources.
			if (typeof q.projectId === 'string' && q.projectId !== request.user.projectId)
				return response.jsonError(new Error('forbidden'));
			
			q.projectId = request.user.projectId;
		}

		if (q.mode === 'ids_by_form' || q.mode === 'ids_by_entity') {
			if (q.mode === 'ids_by_form')
				promise = Input.storeInstance.listIdsByDataSource(q.projectId, q.formId);
			else // mode === 'ids_by_entity'
				promise = Input.storeInstance.listIdsByEntity(q.projectId, q.entityId);
		}
		else {
			if (q.mode === 'current+last')
				promise = Input.storeInstance.getLasts(q.projectId, q.formId, q.entityId, q.period);
			else if (q.mode !== undefined)
				promise = Promise.reject(new Error('invalid_mode'));
			else if (typeof q.projectId === 'string')
				promise = Input.storeInstance.listByProject(q.projectId);
			else
				promise = Input.storeInstance.list(); // get all from all projects, never happens for partners.
		}

		promise.then(response.jsonPB, response.jsonErrorPB);
	})

	/**
	 * Retrieve one input by id
	 */
	.get('/input/:id', function(request, response) {
		var projectId = request.params.id.split(':')[0];
		if (request.user.type === 'partner' && request.params.id !== request.user.projectId)
			return response.jsonError(new Error('forbidden'));

		Input.storeInstance.get(request.params.id).then(response.jsonPB, response.jsonErrorPB);
	})

	/**
	 * Save an input
	 */
	.put('/input/:id', bodyParser, function(request, response) {
		// Validate that the _id in the payload is the same as the id in the URL.
		if (request.body._id !== request.params.id)
			return response.jsonError(new Error('id_mismatch'));

		// Create new Input
		var input;
		try { input = new Input(request.body); }
		catch (e) { return response.jsonError(e); }

		// Get project to check ACLs and format
		Project.storeInstance.get(input.project).then(function(project) {
			// Check ACLs
			var projectUser = project.getProjectUser(request.user),
				projectRole = project.getRole(request.user);

			if (projectRole !== 'owner' &&
				projectRole !== 'input_all' &&
				!(projectRole === 'input' && projectUser.entities.indexOf(input.entity) !== -1))
				throw new Error('forbidden');

			return input.save();
		}).then(response.jsonPB, response.jsonErrorPB);
	})

	/**
	 * Delete an input.
	 */
	.delete('/input/:id', function(request, response) {
		var projectId = request.params.id.split(':')[0];
		if (request.user.type === 'partner' && request.params.id !== request.user.projectId)
			return response.jsonError(new Error('forbidden'));

		Promise
			.all([Project.storeInstance.get(projectId), Input.storeInstance.get(request.params.id)])
			.then(function(res) {
				var project = res[0], input = res[1];

				// Check ACLs
				var projectUser = project.getProjectUser(request.user),
					projectRole = project.getRole(request.user);

				if (projectRole !== 'owner' &&
					projectRole !== 'input_all' &&
					!(projectRole === 'input' && projectUser.entities.indexOf(input.entity) !== -1))
					throw new Error('forbidden');

				return input.destroy();
			})
			.then(response.jsonPB, response.jsonErrorPB);
	})

	/**
	 * List indicators, themes, users
	 * (Those are public data).
	 */
	.get('/:modelName(indicator|theme|user)', function(request, response) {
		var ModelsByName = {indicator: Indicator, theme: Theme, user: User},
			Model = ModelsByName[request.params.modelName];

		Model.storeInstance.list().then(response.jsonPB, response.jsonErrorPB);
	})

	/**
	 * Get an indicator, theme or user.
	 */
	.get('/:modelName(indicator|theme|user)/:id', function(request, response) {
		var ModelsByName = {indicator: Indicator, theme: Theme, user: User},
			Model = ModelsByName[request.params.modelName];

		Model.storeInstance.get(request.params.id).then(response.jsonPB, response.jsonErrorPB);
	})

	/**
	 * Save an indicator, theme or user (need to be admin).
	 */
	.put('/:modelName(indicator|theme|user)/:id', bodyParser, function(request, response) {
		// Only admin accounts can touch indicators, themes and users.
		if (request.user.role !== 'admin')
			return response.jsonError(new Error('forbidden'));

		// Validate that the _id in the payload is the same as the id in the URL.
		if (request.body._id !== request.params.id)
			return response.jsonError(new Error('id_mismatch'));

		// Save the model.
		var ModelsByName = {indicator: Indicator, theme: Theme, user: User},
			Model = ModelsByName[request.params.modelName];

		var model;
		try {
			model = new Model(request.body);
			model.save().then(response.jsonPB, response.jsonErrorPB);
		}
		catch (e) {
			return response.jsonError(e);
		}
	})

	/**
	 * Delete an indicator, theme or user (need to be admin).
	 */
	.delete('/:modelName(indicator|input|theme)/:id', bodyParser, function(request, response) {
		// Only admin accounts can touch indicators, themes and users.
		if (request.user.role !== 'admin')
			return response.jsonError(new Error('forbidden'));

		// Save the model.
		var ModelsByName = {indicator: Indicator, theme: Theme, user: User},
			Model = ModelsByName[request.params.modelName];

		Model.storeInstance.get(request.params.id)
			.then(function(model) {
				return model.destroy();
			})
			.then(response.jsonPB, response.jsonErrorPB);
	});
