var jsdom = require("jsdom");
var fs = require("fs");


var baseUrl = "http://www.legifrance.gouv.fr/";

var findRomanNumeral = function (stringContainingRomanNumeral) {};
var convertRomanNumeralToArabicNumeral = function (romanNumeral) {};

var parseDateVersion = function (dateVersionElement) {};

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
var parseCode = function ($, codeElement) {
	// GET VERSION
	var dateVersion = $(codeElement).find("#titreTexte .sousTitreTexte").text().substr(26).split(" ");
	console.log(dateVersion[0] + dateVersion[1] + dateVersion[2]);

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
var parseLivre = function (livreElement) {};
var parseTitre = function (titreElement) {};
var parseChapitre = function (chapitreElement) {};
var parseSection = function (sectionElement) {};
var parseSousSection = function (sousSectionElement) {};
var parseParagraphe = function (paragrapheElement) {};

var requestArticle = function (articleUrl) {};
var parseArticle = function (articleElement) {};

var requestCodes = function () {
	jsdom.env(
		baseUrl + "initRechCodeArticle.do",
		["http://code.jquery.com/jquery-1.6.min.js"],
		function (errors, window) {
			var index = 1;
			var $ = window.jQuery;

			var codeOptions = $("form[name=rechCodeArticleForm] span.selectCode select#champ1 option");
			console.log(codeOptions.length);

			var codes = [];

			codeOptions.each(
				function () {
					var title = $(this).attr("title");

					if (!title) {
						return;
					}

					var value = $(this).attr("value");

					if (!value) {
						return;
					}
					if (-1 === value.indexOf("LEGITEXT")) {
						console.log("ERROR - Value invalid for title: " + title);
						return;
					}

					var safeName = title.toLowerCase();
					safeName = safeName.replace(/[àáäâ]/g, "a");
					safeName = safeName.replace(/[èéëê]/g, "e");
					safeName = safeName.replace(/[ìíïî]/g, "i");
					safeName = safeName.replace(/[òóöô]/g, "o");
					safeName = safeName.replace(/[ùúüû]/g, "u");
					safeName = safeName.replace(/[æ]/g, "ae");
					safeName = safeName.replace(/[œ]/g, "oe");
					safeName = safeName.replace(/[(),]/g, "");
					safeName = safeName.replace(/[^a-zA-Z0-9]/g, "-");

					var href = "codes/" + safeName + ".json";

					codes.push(
						{
							id: index,
							name: title,
							href: href
						}
					);

					var url = baseUrl + "affichCode.do?cidTexte=" + value;
					//requestCode(url);

					fs.writeFile(
						href,
						"{}",
						function (error) {
							if (error) {
								console.log("ERROR - Could not save file, see error below.");
								console.log(error);
							}
							else {
								console.log("SUCCESS - The file " + href + " was saved!");
							}
						}
					);

					index++;
				}
			);
			//console.log(codes);

			// HIERARCHY
			//
			// - Titre preliminaire
			// - Livre (I-V)
			//   - Titre
			//     - Chapitre
			//       - Section
			//         - Sous-section
			//           - Paragraphe
			//	- Article
			//    . creer {}
			//    . modifie [{}, {}, {}, ...]
			//    . texte ""
		}
	);
};

requestCodes();
