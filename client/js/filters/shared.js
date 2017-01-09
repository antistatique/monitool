"use strict";

// https://gist.github.com/darlanalves/5b0865b7e3c8e3b00b67

angular.module('monitool.filters.shared', [])

	.filter('length', function() {
		return function(obj) {
			return obj ? Object.keys(obj).length : 0;
		};
	})

	.filter('unsafe', function($sce) {
		return $sce.trustAsHtml;
	})

	.filter('translate_list', function($filter) {
		return function(items) {
			return items.map(function(i) {
				return $filter('translate')(i);
			});
		};
	})

	.filter('join', function() {
		return function(list, token) {
			return (list||[]).join(token);
		};
	})

	.filter('pluck', function() {
		function pluck(objects, property) {
			if (!(objects && property && angular.isArray(objects)))
				return [];

			property = String(property);
			
			return objects.map(function(object) {
				// just in case
				object = Object(object);
				
				if (object.hasOwnProperty(property)) {
					return object[property];
				}
				
				return '';
			});
		}
		
		return function(objects, property) {
			return pluck(objects, property);
		}
	})

	.filter('getObjects', function() {
		return function(ids, objects) {
			objects = objects || {};
			ids = ids || [];

			var objectsById = {};
			for (var key in objects) {
				var obj = objects[key];
				objectsById[obj.id || obj._id] = obj;
			}

			return ids.map(function(id) { return objectsById[id]; });
		}
	})

	.filter('nl2br', function() {
		return function(str) {
			return str.replace(/\n/g, "<br/>");
		};
	})

	.filter('maxLength', function() {
		return function(string, size) {
			if (!string)
				return string;

			if (string.length > size) {
				return string.slice(0, size - 3) + '...';
			}
			else
				return string;
		};
	})

	.filter('formatPatch', function() {

		var resolvePath = function(obj, path) {
			path.substring(1).split('/').forEach(function(part) {
				obj = obj[part];
			});

			return obj;
		};

		var formatOperation = {
			add: function(patch, operation) {
				if (operation.path.match(/^\/themes\/\d+$/))
					return "Ajoute la thématique " + operation.value;
				else if (operation.path.match(/^\/entities\/\d+$/))
					return "Crée le site " + operation.value.name;
				else if (operation.path.match(/^\/groups\/\d+$/))
					return "Crée le groupe " + operation.value.name;
				else if (operation.path.match(/^\/groups\/\d+\/members\/\d+$/)) {
					var groupIndex = operation.path.match(/^\/groups\/(\d+)\/members\/\d+$/)[1];
					return "Ajoute le site " + operation.value + " au groupe " + patch.before.groups[groupIndex].name;
				}
				else if (operation.path.match(/^\/users\/\d+$/)) {
					if (operation.value.id)
						return "Ajoute l'utilisateur MDM " + operation.value.id;
					else
						return "Crée le partenaire " + operation.value.username;
				}
				else if (operation.path.match(/^\/users\/\d+\/entities\/\d+$/)) {
					var userIndex = operation.path.match(/^\/users\/(\d+)\/entities\/\d+$/)[1],
						user = patch.before.users[userIndex];

					if (user.id)
						return "Ajoute le site " + operation.value + " à l'utilisateur " + user.id;
					else
						return "Ajoute le site " + operation.value + " au partenaire " + user.username;
				}
				else if (operation.path.match(/^\/forms\/\d+$/))
					return "Crée la source de données " + operation.value.name;
				else if (operation.path.match(/^\/forms\/\d+\/entities\/\d+$/)) {
					var formIndex = operation.path.match(/^\/forms\/(\d+)\/entities\/\d+$/)[1],
						form = patch.before.forms[userIndex];

					return "Ajoute le site " + operation.value + " à la source de données " + form.name;
				}
				else if (operation.path.match(/^\/forms\/\d+\/elements\/\d+$/)) {
					var formIndex = operation.path.match(/^\/forms\/(\d+)\/elements\/\d+$/)[1],
						form = patch.before.forms[userIndex];

					return "Ajoute la variable " + operation.value.name + " à la source de données " + form.name;
				}
				else {
					return "Autre création";
				}


				// une thematique
				// un site, un groupe, un membre dans un groupe
				// un utilisateur, un site à un utilisateur
				// une data source, un site dans une data source, une variable, une partition, un element de partition, un groupe de partition
				// un cadre logique, un indicateur dans un cadre logique, un objectif specifique, un resultat, un parametre dans une formule
				// un indicateur transversal, un parametre d'indicateur transversal
				// un indicateur extra, un parametre d'indicateur extra


			},
			replace: function(patch, operation) {
				var previousValue = resolvePath(patch.before, operation.path),
					newValue = operation.value;

				if (operation.path === '/name')
					return "Renomme le projet de <code>" + previousValue + "</code> vers <code>" + operation.value + "</code>";
				else if (operation.path === "/start")
					return "Modifie la date de début du projet: " + operation.value;
				else if (operation.path === '/end')
					return "Modifie la date de fin du projet: " + operation.value;
				else if (operation.path === '/country')
					return "Modifie le pays de <code>" + previousValue + "</code> vers <code>" + operation.value + "</code>";
				else
					return "Autre modification";
			},
			remove: function(patch, operation) {

			}
		};

		return function(patch) {
			return patch.forwardSteps.map(function(operation) {
				return formatOperation[operation.op](patch, operation);
			});
		}
	})