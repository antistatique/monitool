"use strict";

var jsonpatch    = require('fast-json-patch'),
	validator    = require('is-my-json-valid'),
	passwordHash = require('password-hash'),
	ProjectStore = require('../store/project'),
	Model        = require('./model'),
	DataSource   = require('./data-source'),
	Indicator    = require('./indicator'),
	Input        = require('./input'),
	Theme        = require('./theme'),
	schema       = require('../schema/project.json');

var validate = validator(schema),
	storeInstance = new ProjectStore();

class Project extends Model {

	static get storeInstance() { return storeInstance; }

	/**
	 * Deserialize and validate a project that comes from the API/DB.
	 */
	constructor(data) {
		super(data, validate);

		// Check that entity ids exist in groups, ...
		var entityIds = data.entities.map(e => e.id);
		data.groups.forEach(function(group) {
			group.members.forEach(function(entityId) {
				if (entityIds.indexOf(entityId) === -1)
					throw new Error('invalid_data');
			});
		});

		// FIXME a lot is missing here.


		// Create forms
		this.forms = this.forms.map(f => new DataSource(f));

		// Replace passwords by a salted hash
		this.users.forEach(function(user) {
			if (user.type === 'partner' && typeof user.password === 'string' && !user.password.match('^sha1\$[0-9a-z]+$'))
				user.password = passwordHash.generate(user.password);
		});
	}

	/**
	 * Retrieve a datasource by id.
	 */
	getDataSourceById(id) {
		return this.forms.find(ds => ds.id === id);
	}

	/**
	 * Retrieve the user object from the project that correspond to a user session (request.user).
	 * User session may be a real user, or a partner.
	 * This method does not throw if the user is not found.
	 */
	getProjectUser(user) {
		if (user.type === 'partner')
			return user.projectId === this._id ? user : null;

		else if (user.type === 'user')
			return this.users.find(u => u.id === user._id);

		else
			throw new Error('invalid_user');
	}

	/**
	 * Get the role of an account from its session.
	 * The role may be one of: "none", "readonly", "input", "input_all" or "owner".
	 */
	getRole(user) {
		if (user.type === 'partner')
			return user.projectId !== this._id ? 'none' : user.role;

		else if (user.type === 'user') {
			if (user.role === 'admin')
				return 'owner';
			else {
				var projectUser = this.getProjectUser(user);
				return projectUser ? projectUser.role : 'readonly';
			}
		}
		else
			throw new Error('invalid_user');
	}

	/**
	 * Retrieve a partner account from its username.
	 * This is used to update passwords
	 */
	getPartnerByUsername(username) {
		return this.users.find(function(u) { return u.username === username });
	}

	/**
	 * Validate that project does not make references to indicators and themes that don't exist.
	 */
	validateForeignKeys() {
		return Promise.all([Indicator.storeInstance.list(), Theme.storeInstance.list()]).then(function(res) {
			var indicators = res[0], themes = res[1];

			Object.keys(this.crossCutting).forEach(function(indicatorId) {
				if (indicators.filter(i => i._id === indicatorId).length === 0)
					throw new Error('invalid_reference');
			});

			this.themes.forEach(function(themeId) {
				if (themes.filter(t => t._id === themeId).length === 0)
					throw new Error('invalid_reference');
			});
		}.bind(this));
	}

	/**
	 * Save the project.
	 *
	 * This method makes many checks do deal with the fact that there are no foreign keys nor update method.
	 * 	- validate that all foreign keys exist.
	 *	- copy the passwords that were not changed for partners.
	 *	- update all inputs that need a change (depending on structural changes in data sources).
	 */
	save(skipChecks, user) {
		// If we skip checks, because we know what we are doing, just delegate to parent class.
		if (skipChecks)
			return super.save(true);

		return this.validateForeignKeys()

			// Get former project or null if missing.
			.then(function() {
				return Project.storeInstance.get(this._id).catch(function(error) {
					// if we can't get former project for some other reason than "missing" we are done.
					return error.message === 'missing' ? null : Promise.reject(error);
				});
			}.bind(this))

			// Compute the list of documents that will need updating.
			.then(function(oldProject) {
				if (oldProject) {
					// Early quit on revision mismatch to ensure that we won't leave the database in an inconsistent way with the bulk update.
					if (oldProject._rev !== this._rev)
						throw new Error('revision_mismatch');

					// Copy old passwords from the old project
					this._copyUnchangedPasswords(oldProject);

					// Compute list of documents that require updating (project + revision + inputs).
					return this._computeInputsUpdates(oldProject).then(function(inputUpdates) {
						return [this, this._computeRevision(oldProject, user)].concat(inputUpdates);
					}.bind(this));
				}
				else {
					if (this._rev)
						throw new Error('revision_provided_at_creation');

					return [this];
				}
			}.bind(this))

			.then(function(updates) {

				// FIXME
				// Bulk operations are not really atomic in a couchdb database.
				// if someone else is playing with the database at the same time, we might leave the database in an inconsistent state.
				// This can be easily fixed http://stackoverflow.com/questions/29491618/transaction-like-update-of-two-documents-using-couchdb
				// For now we assume that everything will work properly because we checked for revision mismatch just before.
				return Project.storeInstance._callBulk({docs: updates});
			}.bind(this))

			.then(function(bulkResults) {
				// bulk updates don't give us the whole document
				var projectResult = bulkResults.find(res => res.id === this._id);
				if (projectResult.error)
					throw new Error(projectResult.error);

				this._rev = projectResult.rev;
				return this; // return updated document.
			}.bind(this));
	}

	toAPI() {
		var json = Object.assign({}, this);

		// Replace the password by null before sending the project to the user.
		json.users = this.users.map(function(user) {
			user = Object.assign({}, user);
			if (user.type === 'partner')
				user.password = null;

			return user;
		});

		return json;
	}

	/**
	 * Take the previous version of the project, and copies all password hashes
	 * from it (this allows not sending them to the client back and forth).
	 * This is used when saving the project.
	 */
	_copyUnchangedPasswords(oldProject) {
		this.users.forEach(function(user) {
			if (user.type === 'partner') {
				// retrieve old user.
				var oldUser = oldProject.getPartnerByUsername(user.username);

				// copy hash or raise error
				if (user.password === null) {
					if (oldUser)
						user.password = oldUser.password;
					else
						throw new Error('invalid_data');
				}
			}
		});
	}

	_computeRevision(oldProject, user) {
		return {
			_id: 'revision:' + this._id + ':' + this._rev,
			type: "revision",
			date: new Date().toISOString(),
			user: user ? user.name : null,
			reversePatch: jsonpatch.compare(this, oldProject),
			reversable: true
		};
	}

	/**
	 * Take the previous version of the project, and compute all updates
	 * to inputs that are needed to deal with the structural changes of the forms.
	 */
	_computeInputsUpdates(oldProject) {
		var changedFormsIds = [];

		// Get all forms that existed before, and changed since last time.
		this.forms.forEach(function(newForm) {
			var oldForm = oldProject.getDataSourceById(newForm.id);

			if (oldForm && oldForm.signature !== newForm.signature)
				changedFormsIds.push(newForm.id)
		});

		// Get all forms that were deleted.
		oldProject.forms.forEach(function(oldForm) {
			if (!oldProject.getDataSourceById(oldForm.id))
				changedFormsIds.push(oldForm.id);
		});

		var promises = changedFormsIds.map(dataSourceId => Input.storeInstance.listByDataSource(this._id, dataSourceId));

		return Promise.all(promises).then(function(inputs) {
			inputs = inputs.reduce((m, e) => m.concat(e), []);
			inputs.forEach(input => input.update(oldProject, this));
			return inputs;
		}.bind(this));
	}



}


module.exports = Project;
