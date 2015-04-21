"use strict";

angular
	.module('monitool.controllers.helper', [])

	.controller('MainMenuController', function($state, $scope, $translate, $locale, $rootScope) {
		$scope.$state   = $state;
		
		$scope.changeLanguage = function(langKey) {
			$translate.use(langKey);

			if (langKey == 'fr')
				angular.copy(FRENCH_LOCALE, $locale);
			else if (langKey == 'es')
				angular.copy(SPANISH_LOCALE, $locale);
			else
				angular.copy(ENGLISH_LOCALE, $locale);

			$rootScope.language = langKey;
			$scope.$broadcast('languageChange');
		};

		$scope.logout = function() {
			window.location.href = 'https://mdm1.sharepoint.com';
		};
	})
