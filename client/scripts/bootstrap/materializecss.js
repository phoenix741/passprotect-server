'use strict';

import 'materialize-css/bin/materialize';

// Extend the default picker options for all instances.
$.extend($.fn.pickadate.defaults, {
	formatSubmit: 'yyyy-mm-dd',
	hiddenName: true,
	selectMonths: true,
	selectYears: 120
});

$.extend($.fn.pickadate.defaults, {
	monthsFull: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
	monthsShort: ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'],
	weekdaysFull: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
	weekdaysShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
	weekdaysLetter: [ 'D', 'L', 'M', 'M', 'J', 'V', 'S' ],
	today: 'Aujourd\'hui',
	clear: '',
	close: 'Définir',
	firstDay: 1,
	format: 'dd mmmm yyyy',
	formatSubmit: 'yyyy/mm/dd',
	labelMonthNext: 'Mois suivant',
	labelMonthPrev: 'Mois précédent',
	labelMonthSelect: 'Sélectionner un mois',
	labelYearSelect: 'Sélectionner une année'
});

$(function () {
	$('.button-collapse').sideNav();
	$('.parallax').parallax();
});
