"use strict";

var FRENCH_LOCALE = {
	id: "fr-fr",
	DATETIME_FORMATS: {
		AMPMS: [ "AM", "PM" ],
		DAY: [ "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi" ],
		MONTH: [ "janvier", "f\u00e9vrier", "mars", "avril", "mai", "juin", "juillet", "ao\u00fbt", "septembre", "octobre", "novembre", "d\u00e9cembre" ],
		SHORTDAY: [ "dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam." ],
		SHORTMONTH: [ "janv.", "f\u00e9vr.", "mars", "avr.", "mai", "juin", "juil.", "ao\u00fbt", "sept.", "oct.", "nov.", "d\u00e9c." ],
		fullDate: "EEEE d MMMM y",
		longDate: "d MMMM y",
		medium: "d MMM y HH:mm:ss",
		mediumDate: "d MMM y",
		mediumTime: "HH:mm:ss",
		short: "dd/MM/y HH:mm",
		shortDate: "dd/MM/y",
		shortTime: "HH:mm"
	},
	NUMBER_FORMATS: {
		CURRENCY_SYM: "\u20ac",
		DECIMAL_SEP: ",",
		GROUP_SEP: "\u00a0",
		PATTERNS: [
			{
				gSize: 3,
				lgSize: 3,
				maxFrac: 3,
				minFrac: 0,
				minInt: 1,
				negPre: "-",
				negSuf: "",
				posPre: "",
				posSuf: ""
			},
			{
				gSize: 3,
				lgSize: 3,
				maxFrac: 2,
				minFrac: 2,
				minInt: 1,
				negPre: "-",
				negSuf: "\u00a0\u00a4",
				posPre: "",
				posSuf: "\u00a0\u00a4"
			}
		]
	},
	"pluralCat": function(n, opt_precision) {
		var i = n | 0;
		if (i == 0 || i == 1)
			return PLURAL_CATEGORY.ONE;
		
		return PLURAL_CATEGORY.OTHER;
	}
};




var FRENCH_TRANSLATION = {
	shared: {
		up: "Monter d'un cran",
		down: "Descendre d'un cran",
		sum: "Total",
		include: "Inclure",
		toggle: "Changer",
		toggle_all: "Changer tous",

		date: "Date",
		administrator: "Administrateur",

		back_to_intranet: "Retourner sur l'intranet",
		settings: "Paramètres",
		projects: 'Projets',
		project: 'Projet',
		users: "Utilisateurs",
		indicator: 'Indicateur',
		indicators: 'Indicateurs',
		indicators_catalog: 'Catalogue Indicateurs',
		help: 'Aide',
		name: 'Nom',
		begin: 'Début',
		end: 'Fin',

		add: 'Ajouter',
		save: 'Sauvegarder',
		remove: 'Retirer',
		remove_changes: 'Annuler les modifications',
		edit: 'Modifier',
		'delete': 'Supprimer',

		view_stats: 'Voir les statistiques',
		members: 'Membres',

		day: 'Jour',
		week: 'Semaine',
		month: 'Mois',
		quarter: "Trimestre",
		year: "Année",
		
		done: 'Fait',
		copy: 'Copier',
		choose: 'Choisir',
		edition: 'Édition',
		cancel: 'Annuler',
		logical_frame: 'Cadre logique',
		description: 'Description',
		reporting: 'Statistiques',
		reporting_general: 'Statistiques générales',
		reporting_by_indicator: 'Statistiques par indicateur',
		reporting_by_variable: 'Statistiques par variable',
		reporting_analysis: "Analyse descriptive",
		columns: "Colonnes",
		colorize: 'Colorer',
		display: 'Afficher',
		values: 'Indicateurs cadre logique',
		target_percentage: 'Avancement cadre logique',
		plot: 'Grapher',
		download_plot: 'Télécharger le graphique',
		download_table: 'Télécharger le tableau',
		unknown_indicator: "Indicateur inconnu",
		active: "Actif",

		choose_indicator: 'Choisissez un indicateur',
		list: 'Liste',
		logout: 'Déconnecter',
		change_password: "Changer le mot de passe",
		detach: "Déplacer vers supplémentaires",

		stay_here_check: 'Vous avez realisé des changements. OK pour rester sur cette page, Annuler pour perdre les modifications.',
		filter: "Filtre",
		'export': "Export",
		none: "Aucune"
	},
	menu: {
		toggle_nav: "Voir le menu",
		language: "Langue",
		french: "Français",
		spanish: "Espagnol",
		english: "Anglais",
	},

	help: {
		block: {
			general: "Général",
			indicators: "Catalogue d'indicateurs",
			project: "Projets",
		},
		page: {
			presentation_general: "Présentation",
			presentation_project: "Présentation",
			presentation_indicator: "Présentation",

			offline_access: "Utilisation offline",
			acls: "Droits d'accès",
			translation: "Traduction",

			completeness: "Exhaustivité et contraintes",
			operation_modes: "Mode d'opérations",
			computation: "Formules et agrégation",
			collection_history: "Historique de collecte",

			logical_frame: "Cadre logique",
			entities_groups: "Lieux de collecte et groupes",
			input_forms: "Plannings de saisie",
			users: "Droits d'accès",

			inputs: "Saisies",
			statistics: "Statistiques",
			descriptive_analysis: "Analyse Descriptives",
			change_definition: "Re-spécification",
		},
		reminder: {
			have_you_read_single_pre: "Avez-vous lu la section",
			have_you_read_single_post: "dans la documentation?",
			have_you_read_multiple: "Avez-vous lu les sections suivantes dans la documentation?",
		}
	},

	project: {
		actions: "Actions",
		groups: "Groupes",
		basics: "Données de base",
		general: "Général",
		full_project: "Tout le projet",
		select_filters: "Sélectionnez les partitions désirées",

		collection_form_warning:
			'<strong>Attention, en modifiant cette page vous risquez de perdre des données</strong><br/>' + 
			'{{num_inputs}} saisies ont déjà été réalisées sur ce formulaire.' + 
			'<ul>' + 
			'	<li>Toute modification sur le planning (périodicité, dates) causera la suppression des saisies exclues du nouveau planning</li>' + 
			'	<li>Toute modification sur la structure des données collectées sera répercutée sur toutes les saisies passées de ce formulaire</li>' + 
			'</ul>',

		sections: "Sections",
		variables: "Variables",
		partitions: "Partitions",

		add_variable: "Ajouter une variable",
		remove_variable: "Supprimer la variable",
		add_partition: "Ajouter une partition",
		remove_partition: "Supprimer la partition",
		add_partition_element: "Ajouter un élément",
		remove_partition_element: "Supprimer l'élément",

		aggregation: 'Agrégation',
		different_geos: 'Sur des lieux différents',
		same_geos: 'Sur un même lieu',

		none: "Ne pas agréger",
		sum: "Somme",
		average: "Moyenne",
		highest: "Plus grand valeure",
		lowest: "Plus petite valeure",
		last: "Dernière valeur",

		section_up: "Monter la section d'un cran",
		section_down: "Descendre la section d'un cran",
		variable_up: "Monter la variable d'un cran",
		variable_down: "Descendre la variable d'un cran",
		remove_section: "Supprimer la section",

		please_select_variable: "Selectionnez une variable",
		no_partitions_available: "Pas de partitions disponibles",

		collection_site_list: "Lieux de collecte",
		collection_form_list: "Formulaires de collecte",
		collection_input_list: "Saisie",

		collection_site: "Lieu de collecte",
		collection_form: "Formulaire de collecte",

		collection_form_planning: "Planning de saisie",
		collection_form_structure: "Structure du formulaire",

		remove_partition: "Supprimer la partition",

		delete_form_easy: "Voulez-vous vraiment supprimer ce planning de saisie?",
		delete_form_hard: "Si vous supprimez ce planning, toutes les saisies associées seront supprimés. Tapez \"Supprimer les {{num_inputs}} saisies\" pour confirmer",
		delete_form_hard_answer: "Supprimer les {{num_inputs}} saisies",
		delete_entity: "Si vous supprimez ce lieu d'activité, toutes les saisies associées seront supprimés. Tapez \"Supprimer les {{num_inputs}} saisies\" pour confirmer",
		delete_entity_answer: "Supprimer les {{num_inputs}} saisies",

		running: "Projets en cours",
		finished: "Projets terminés",
		noproject: "Aucun projet ne correspond à ce critère",
		inputs: "Saisies",

		last_input: "Dernière saisie: ",

		value: "Valeur",
		activity: "Activités",
		activity_management: "Suivi des activités",
		partitions: "Partitions",
		variable: "Variable",
		section: "Section",

		unknown: "Inconnu",
		color: "Couleur",

		specs: "Spécifications",
		indicators_management: "Suivi des indicateurs",
		additional_indicators: "Indicateurs supplémentaires",
		no_additional_indicators: "Aucun indicateur supplémentaire n'a été défini",
		no_purposes: "Aucun objectif spécifique n'a été défini",

		input_form_list: "Liste des plannings de saisie",
		indicator_distribution: "Distribution des indicateurs par planning de saisie et période",
		add_new_indicator_to_form: "Ajouter un nouvel indicateur au formulaire",

		form_name_ph: "ex: Collecte mensuelle pour les centres de santé",
		collect: "Collecter sur",

		analysis: "Analyse",
		analysis_insert_data: "Insérer des données",
		analysis_insert_text: "Insérer du texte",
		analysis_up_next: "Monter",
		analysis_down_next: "Descendre",
		analysis_delete_next: "Supprimer",
		analysis_data: "Affichage",
		analysis_table: "Tableau",
		analysis_graph: "Graphique",
		analysis_both: "Tableau & Graphique",
		report_name_ph: "ex: Analyse descriptive mensuelle mai 2015",
		no_reports: "Aucune analyse descriptive n'a encore été créé!",

		source: "Source",
		source_ph: "Ex: NHIS local",
		in_charge: "Personne responsable",
		in_charge_ph: "Ex: Infirmière projet",

		missing_mandatory_indicators: "Indicateurs obligatoires manquants",
		other_indicators: "Autres indicateurs",
		see_other_themes: "Voir aussi les autres thématiques",

		entity_name: "Nom de la structure ou lieu d’intervention",
		group_name: "Nom du groupe",
		entity_name_placeholder: "ex: Centre de santé X, Hôpital X, ...",
		group_name_placeholder: "ex: Hôpitaux régionaux, parti Nord du pays, ...",

		logical_frame_tooltip: 'Décrit les objectifs, resultats attendus et activitées mises en oeuvre par le projet.',
		input_entities_tooltip: 'Liste les Lieux de collecte du projet où sont collectés les indicateurs. Par exemple des hopitaux, centre de santé, villages...',
		input_groups_tooltip: 'Permet de grouper les Lieux de collecte par catégories logiques.',
		input_forms_tooltip: 'Déclaration des formulaires et du planning de saisie des indicateurs de suivi du projet.',
		waiting_inputs_tooltip: '',
		reporting_tooltip: '',

		create: "Créer un nouveau projet",
		input_forms: 'Plannings de saisie',
		input_form: 'Planning de saisie',
		data_collection: 'Collecte',
		periodicity: "Périodicité",
		begin: 'Début du projet',
		end: 'Fin du projet',

		sumable: 'Sommable',
		input_field: 'Champ de saisie',
		value_source: 'Source de la valeur',
		input_mode: 'Mode de saisie',
		manual_input: 'Saisies manuelles',

		periodicities: {
			day: 'Tous les jours',
			week: 'Toutes les semaines',
			month: 'Tous les mois',
			quarter: 'Tous les trimestres',
			year: 'Tous les ans',
			planned: 'Planifiée'
		},
		collects: {
			entity: "Lieux de collecte",
			project: "Projet"
		},

		add_intermediary: "Ajouter une saisie",
		intermediary_periods: "Dates supplémentaires",

		no_input_entities: 'Aucun lieu d\'activité n\'a encore été créé!',
		no_input_groups: 'Aucun groupe d\'activité n\'a encore été créé!',
		no_forms: 'Aucun formulaire n\'a encore été créé',
		no_indicators: 'Aucun indicateur n\'est défini sur ce projet',

		waiting_inputs: 'Saisies en attente',
		finished_inputs: 'Saisies réalisées',
		invalid_inputs: 'Saisies hors planning',

		no_inputs: 'Aucune saisie ne correspond à ce critère.',
		input: 'Saisir',

		relevance: 'Pertinence',
		relevance_ph: 'Pourquoi collectez-vous cet indicateur?',
		baseline: 'Baseline',
		baseline_ph: 'Valeur de référence',
		target_ph: 'Valeur à atteindre',
		target: 'Cible',
		general_data: 'Données générales',

		goal: 'Objectif général',
		goal_short: "OG",
		intervention_logic: 'Logique d\'intervention',
		intervention_logic_goal_ph: 'Description de la contribution du projet aux objectifs (impact) d\'une politique ou d\'un programme',
		intervention_logic_purpose_ph: 'Description des avantages directs destinés au(x) groupe(s) cible(s)',
		assumptions_purpose_ph: 'Facteurs externes susceptibles de compromettre l’atteinte de l’objectif',
		purpose_short: 'OS',
		output_short: 'R',

		begin_date: "Date de lancement",
		end_date: "Date de fin",
		name_ph: 'Exemple: Réduction des Risques Laos',
		add_indicator: 'Ajouter un indicateur',

		purpose: 'Objectif Spécifique',
		purposes: 'Objectifs Spécifiques',
		assumptions: 'Hypothèses',
		output: "Résultat",
		activity: 'Activité',
		activities: 'Activités',
		prerequisite: 'Prérequis',
		activity_prereq_ph: 'Quels sont les prérequis pour mettre en place d\'activité?',
		activity_desc_ph: 'Produit ou service tangibles apportés par le projet.',
		output_assumptions_ph: 'Facteurs externes susceptibles de compromettre l’atteinte du résultat',
		output_desc_ph: 'Produit ou service tangibles apportés par le projet.',

		add_activity: 'Ajouter une activité',
		add_output: 'Ajouter un résultat attendu',
		add_purpose: 'Ajouter un objectif spécifique',

		users: "Utilisateurs",
		owners: "Propriétaires",
		dataEntryOperators: "Opérateurs de saisie",

		move_up: "Monter",
		move_down: "Descendre",

		indicator_source: "Obtention",
		you_are_owner: "Vous pouvez éditer ce projet",
		you_are_editor: "Vous pouvez saisir sur ce projet",
		you_are_not_owner: "Vous ne pouvez pas éditer ce projet",
		you_are_not_editor: "Vous ne pouvez pas saisir sur ce projet",

		formula: "Formule: {{name}}",
		link: "Lien: {{name}}",
		links: "Liens"
	},
	indicator: {
		classification: "Classification",
		is_unchanged: "Le bouton est vérouillé car auncune modication n'a eu lieu",
		is_invalid: "Le bouton est vérouillé car le formulaire est invalide. Avez-vous rempli les noms et les éléments de la formule?",

		is_mandatory: "Obligatoire - Doit être collecté pour tous les projets de même thématique",
		is_approved: "Approuvé - Peut ou non être collecté sur les projets de même thématique",
		is_waiting: "En attente - Le siège ne s'est pas prononcé sur la qualité de cet indicateur",
		is_forbidden: "Rejeté - Ne doit plus être collecté sur les nouveaux projets",
		
		num_collecting_projects: "Nombre de projets collectant cet indicateur",

		search: "Rechercher",
		search_ph: "Rentrez au moins 3 caractères",
		scope: "Portée",

		standard: "Norme",
		sources: "Sources",
		comments: "Notes",
		standard_ph: "À quelle norme appartient cet indicateur?",
		sources_ph: "Quelles sont les sources possibles pour cet indicateur?",
		comments_ph: "Dans quel cas est-il pertinent d'utiliser cet indicateur, et avec quelles limites?",
		metadata: "Metadonnées",

		target: "Relation à la cible",
		higher_is_better: "Atteinte si la saisie est supérieure à la cible",
		lower_is_better: "Atteinte si la saisie est inférieure à la cible",
		around_is_better: "Atteinte si la saisie est égale à la cible",
		non_relevant: "Non pertinent",

		no_theme: 'Sans thématique',
		no_type: 'Sans type',

		operation: "Mode d'opération",
		
		name_ph: 'Exemple: Part des dossiers patient bien remplis',
		definition: 'Définition',
		definition_ph: 'Exemple: Mesurer le niveau de formation du personnel médical qui rempli les dossiers patients. Sa mesure est facile sur des projets de petite dimension, à éviter dans un autre cadre.',
		core: 'Recommandé',
		unit: 'Unité',
		other: 'Autre',
		percent: 'Pour cent (%)',
		permille: 'Pour mille (‰)',
		types: 'Types',
		themes: 'Thématiques',
		select_types: 'Sélectionnez un ou plusieurs types',
		select_themes: 'Sélectionnez une ou plusieures thématiques',
		categorization: 'Classement',
		computation: 'Calcul',
		sum_allowed: 'Sommable',
		formula: 'Formule',
		formulas: 'Formules',
		formula_name_ph: 'Exemple: Pourcentage entre dossiers patient bien remplis et total',
		formula_expression_ph: 'Exemple: 100 * a / b',
		param_name_ph: "Exemple: Nombre de consultations prénatales",
		add_formula: "Ajouter une formule",
		parameter: 'Paramètre',

		order_by: 'Trier par',
		alphabetical_order: 'Ordre alphabétique',
		num_inputs: 'Nombre de saisies',
		num_projects: 'Nombre de projets',
		create_new: 'Créer un nouvel indicateur',

		themes_list: "Liste des thématiques",
		types_list: "Liste des types",
		num_indicators: 'Nombre d\'indicateurs',
		
		new_type_name: "Nom du nouveau type",
		new_theme_name: "Nom de la nouvelle thématique",
		only_core: "Ne voir que les indicateurs recommandés",
		is_external: "Cet indicateur provient d'une autre thématique",
	},
	form: {
		mandatory: "Ce champ est obligatoire",
		begin_lower_than_end: 'La date début de doit être inférieure à la date de fin',
		end_greater_than_begin: 'La date de fin doit être supérieure à la date de début',
	}
};

