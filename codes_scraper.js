var jsdom = require("jsdom");
var fs = require("fs");


var baseUrl = "http://www.legifrance.gouv.fr/";


// UTILS
var replaceSpecialCharacters = function (string) {
	return string.replace(/[àáäâ]/g, "a").replace(/[èéëê]/g, "e").replace(/[ìíïî]/g, "i").replace(/[òóöô]/g, "o").replace(/[ùúüû]/g, "u").replace(/[æ]/g, "ae").replace(/[œ]/g, "oe");
};

var replaceNonAlphaNumericalCharactersByDashes = function (string) {
	return string.replace(/[(),]/g, "").replace(/[^a-zA-Z0-9]/g, "-");
};

var replaceMonthStringByMonthIndex = function (monthString) {
	var monthStringWithoutAccents = replaceSpecialCharacters(monthString.toLowerCase()),
		months = {
			"janvier": 1,
			"fevrier": 2,
			"mars": 3,
			"avril": 4,
			"mai": 5,
			"juin": 6,
			"juillet": 7,
			"aout": 8,
			"septembre": 9,
			"octobre": 10,
			"novembre": 11,
			"decembre": 12
		};

	return months[monthStringWithoutAccents];
};

var findRomanNumeral = function (stringContainingRomanNumeral) {};
var convertRomanNumeralToArabicNumeral = function (romanNumeral) {};


// SUB-SECTION
var parseLivre = function (livreElement) {};
var parseTitre = function (titreElement) {};
var parseChapitre = function (chapitreElement) {};
var parseSection = function (sectionElement) {};
var parseSousSection = function (sousSectionElement) {};
var parseParagraphe = function (paragrapheElement) {};


var requestArticle = function (articleUrl) {};
var parseArticle = function (articleElement) {};


// CODE
var parseDateVersion = function (dateVersionElement) {};

var parseCode = function ($, codeElement) {
	var dateVersion = $(codeElement).find("#titreTexte .sousTitreTexte").text().substr(26).split(" ");

	if (3 === dateVersion.length) {
		console.log(dateVersion[2] + "-" + replaceMonthStringByMonthIndex(dateVersion[1]) + "-" + dateVersion[0]);
	}

	var titreOuLivre = $(codeElement).find("div.data").children("ul.noType");
	console.log(titreOuLivre.length);
	// titreOuLivre.each(
	// 	function (index) {
	// 		console.log("-- New Item --");
	// 		console.log(index);
	// 		console.log($(this).text());
	// 	}
	// );
};

var requestCode = function (codeUrl) {
	jsdom.env(
		codeUrl,
		["http://code.jquery.com/jquery-1.6.min.js"],
		function (errors, window) {
			var $ = window.jQuery;
			parseCode($, "body");
		}
	);
};


// CODES
var parseCodes = function ($, codeOptions) {
	var codes = [];

	codeOptions.each(
		function () {
			var index = 1,
				title = $(this).attr("title"),
				value = $(this).attr("value");

			if (!title) {
				return;
			}
			if (!value) {
				return;
			}
			if (-1 === value.indexOf("LEGITEXT")) {
				console.log("ERROR - Value invalid for title: " + title);
				return;
			}

			var safeName = title.toLowerCase();
			safeName = replaceSpecialCharacters(safeName);
			safeName = replaceNonAlphaNumericalCharactersByDashes(safeName);

			var href = "codes/" + safeName + ".json";

			var codeData = {
				id: index,
				name: title,
				href: href
			};
			codes.push(codeData);

			fs.writeFile(
				href,
				JSON.stringify({ code: codeData }),
				function (error) {
					if (error) {
						console.log("ERROR - Could not save file " + href + ", see error below.");
						console.log(error);
					}
					else {
						console.log("SUCCESS - The file " + href + " was saved!");
					}
				}
			);

			var url = baseUrl + "affichCode.do?cidTexte=" + value;
			requestCode(url);

			index++;
		}
	);

	fs.writeFile(
		"codes.json",
		JSON.stringify({ codes: codes }),
		function (error) {
			if (error) {
				console.log("ERROR - Could not save file codes.json, see error below.");
				console.log(error);
			}
			else {
				console.log("SUCCESS - The file codes.json was saved!");
			}
		}
	);
};

var requestCodes = function () {
	jsdom.env(
		baseUrl + "initRechCodeArticle.do",
		["http://code.jquery.com/jquery-1.6.min.js"],
		function (errors, window) {
			var $ = window.jQuery,
				codeOptions = $("form[name=rechCodeArticleForm] span.selectCode select#champ1 option");

			parseCodes($, codeOptions);
		}
	);
};


// START
requestCodes();


// ========================================
// HIERARCHY
//
// - Titre preliminaire
// - Partie
// 	 - Livre (I-V)
//     - Titre
//       - Chapitre
//         - Section
//           - Sous-section
//             - Paragraphe
//	- Article
//    . creer {}
//    . modifie [{}, {}, {}, ...]
//    . texte ""
//    . cite [{}, {}, {}, ...]
//    . cite par [{}, {}, {}, ...]
//    . codifie par [{}, {}, {}, ...]
//    . anciens textes [{}, {}, {}, ...]
