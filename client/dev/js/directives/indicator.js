"use strict";

angular
	.module(
		'monitool.directives.indicatorForm',
		[
			'monitool.services.translate',
		]
	)
	
	.directive('expression', function() {
		return {
			restrict: 'A',
			require: '?ngModel',
			link: function($scope, $element, attributes, controller) {
				if (!controller)
					return;

				controller.$validators.expression = function(value) {
					try {
						Parser.parse(value);
						return true
					}
					catch (e) {
						return false;
					}
				};

				controller.$validate();		
			}
		}
	})

	.directive('indicatorOperation', function() {
		return {
			restrict: 'E',
			replace: true,
			scope: true,
			template: '<i class="fa fa-fw" ng-class="operationClass" tooltip="{{operationTranslation|translate}}" tooltip-placement="right" ></i>',
			link: function($scope, element, attributes) {
				var indicator = $scope.$eval(attributes.indicator);
				$scope.operationClass = {forbidden: 'fa-ban text-danger', approved: 'fa-check text-success', waiting: 'fa-clock-o text-warning', mandatory: 'fa-asterisk text-success'}[indicator.operation];
				$scope.operationTranslation = 'indicator.is_' + indicator.operation;
			}
		}
	})


