"use strict";

angular.module(
	'monitool.controllers.project.shared',
	[
		'monitool.services.utils.uuid'
	])

	.controller('ProjectListController', function($scope, $state, projects, uuid, themes) {
		$scope.themes = themes;
		$scope.pred = 'country'; // default sorting predicate

		$scope.myProjects = projects.filter(function(p) {
			return p.users.find(function(u) { return u.id == $scope.userCtx._id; });
		});

		$scope.runningProjects = projects.filter(function(p) {
			return $scope.myProjects.indexOf(p) === -1 && p.end >= new Date()
		});
		
		$scope.finishedProjects = projects.filter(function(p) {
			return $scope.myProjects.indexOf(p) === -1 && p.end < new Date()
		});

		$scope.projects = $scope.myProjects;

		$scope.createProject = function() {
			$state.go('main.project.structure.basics', {projectId: uuid.v4()});
		};

		$scope.open = function(project) {
			var projectUser = project.users.find(function(u) {
				return ($scope.userCtx.type == 'user' && u.id == $scope.userCtx._id) ||
					   ($scope.userCtx.type == 'partner' && u.username == $scope.userCtx.username);
			});

			if (projectUser && projectUser.role == 'owner')
				$state.go("main.project.structure.basics", {projectId: project._id});
			else
				$state.go("main.project.reporting.general", {projectId: project._id});
		};
	})
	
	.controller('ProjectMenuController', function($scope, $filter, $state, $rootScope, project) {
		$scope.masterProject = project;

		// When master changes, update menu elements
		$scope.$watch('masterProject', function() {
			$scope.projectReadyForReporting = $scope.masterProject.isReadyForReporting();
			$scope.revision = $scope.masterProject._rev ? $scope.masterProject._rev.substring(0, $scope.masterProject._rev.indexOf('-')) : 0;
		}, true);

		$scope.cloneProject = function() {
			var newName = window.prompt($filter('translate')('project.please_enter_new_name'));

			if (newName) {
				var newProject = $scope.masterProject.clone(newName, $rootScope.userCtx._id);
				
				newProject.$save()
					.then(function() {
						$state.go('main.project.structure.basics', {projectId: newProject._id});
					})
					.catch(function(error) {
						$scope.error = error;
					});
			}
		};

		$scope.deleteProject = function() {
			var translate = $filter('translate'),
				question  = translate('project.are_you_sure_to_delete'),
				answer    = translate('project.are_you_sure_to_delete_answer');

			if (window.prompt(question) === answer)
				project.$delete(function() { $state.go('main.projects'); });
		};
	})
