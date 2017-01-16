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

	.filter('humanizePatch', function($sce, $filter) {
		var translate = $filter('translate');

		return function(patch) {
			var before = JSON.parse(JSON.stringify(patch.before)),
				after  = JSON.parse(JSON.stringify(patch.before));

			var alreadySeen = {};

			var result = '<ul>';
			for (var i = 0; i < patch.forwardPatch.length; ++i) {
				var operation = patch.forwardPatch[i];

				jsonpatch.apply(after, [operation]);

				// let's make some magic.
				var edited_field = operation.path.substring(1).replace(/\/\d+\//g, '_').replace(/\/\d+$/, ''),
					translation_data = {};//handlers[key](match, before, after, operation);

				var splpath = operation.path.split('/').slice(1);
				
				var currentItem = before;
				for (var j = 1; j < splpath.length - 1; j += 2) {
					var name = splpath[j - 1], id = splpath[j];

					currentItem = currentItem[name][id];

					if (name === 'entities')
						name = 'entity';
					else if (name === 'elements' && j < 5)
						name = 'variable';
					else 
						name = name.substring(0, name.length - 1);
					
					translation_data[name] = currentItem;
				}
				
				if (operation.op === 'add') {
					translation_data.item = operation.value;

					// it's an entity => return the entity
					if (edited_field === 'groups_members' || edited_field === 'forms_entities')
						translation_data.item = before.entities.find(function(e) { return e.id === translation_data.item; });

					if (edited_field === 'forms_elements_partitions_groups_members')
						translation_data.item = translation_data.partition.elements.find(function(e) {return e.id == translation_data.item; });
				}
				else if (operation.op === 'replace') {
					translation_data.after = operation.value;
					translation_data.before = before;
					for (var j = 0; j < splpath.length; j += 1)
						translation_data.before = translation_data.before[splpath[j]];

					if (edited_field === 'groups_members' || edited_field === 'forms_entities') {
						translation_data.before = before.entities.find(function(e) { return e.id === translation_data.before; });
						translation_data.after = before.entities.find(function(e) { return e.id === translation_data.after; });
					}

					if (edited_field === 'forms_elements_partitions_groups_members') {
						translation_data.before = translation_data.partition.elements.find(function(e) {return e.id == translation_data.before; });
						translation_data.after = translation_data.partition.elements.find(function(e) {return e.id == translation_data.after; });
					}
				}
				else if (operation.op === 'remove') {
					translation_data.item = before;
					for (var j = 0; j < splpath.length; j += 1)
						translation_data.item = translation_data.item[splpath[j]];

					if (edited_field === 'groups_members' || edited_field === 'forms_entities')
						translation_data.item = before.entities.find(function(e) { return e.id === translation_data.item; });

					if (edited_field === 'forms_elements_partitions_groups_members')
						translation_data.item = translation_data.partition.elements.find(function(e) {return e.id == translation_data.item; });
				}
				else if (operation.op === 'move') {
					translation_data.item = before;
					
					var splpath2 = operation.from.split('/').slice(1);
					for (var j = 0; j < splpath2.length; j += 1)
						translation_data.item = translation_data.item[splpath2[j]];
				}

				// hack around indicator translation strings to factorize translations.
				var translation_string;

				var crossCuttingMatch = edited_field.match(/^crossCutting\/.{36}(.*)$/);
				if (crossCuttingMatch)
					// the ternary here is to handle crosscutting add/remove
					edited_field = 'crossCutting' + (crossCuttingMatch[1].length ? '_' + crossCuttingMatch[1].substring(1) : '');

				var indicatorMatch = edited_field.match(/^logicalFrames.*indicators(.*)$/);
				if (indicatorMatch)
					// truncate purposes and outputs
					edited_field = 'logicalFrames_indicators' + indicatorMatch[1];

				var computationMatch = edited_field.match('^(.*)_computation');
				if (computationMatch) {
					// truncate everything after computation
					edited_field = computationMatch[1] + '_computation';
					translation_string = edited_field + '_replace';
				}
				else {
					translation_string = edited_field + '_' + operation.op;
				}

				var str = translate('project.history.' + translation_string, translation_data);

				if (!alreadySeen[str])
					result += '<li>' + str + '</li>';
				alreadySeen[str] = true;
				jsonpatch.apply(before, [operation]);
			}

			result += '</ul>';

			return $sce.trustAsHtml(result);
		};
	})


