var request = require("request");
var jsdom = require("jsdom");
var fs = require("fs");


var baseUrl = "http://www.legifrance.gouv.fr/";

var findRomanNumeral = function (stringContainingRomanNumeral) {};
var convertRomanNumeralToArabicNumeral = function (romanNumeral) {};

var parseDateVersion = function ($, dateVersionElement) {};

var requestCode = function ($, codeUrl) {
	request(
		{
			uri: codeUrl
		},
		function (error, response, body) {
			if (error && response.statusCode !== 200) {
				console.log("Error when contacting " + baseUrl);
			}

			jsdom.env(
				{
					html: body,
					scripts: [
						"http://code.jquery.com/jquery-1.6.min.js"
					]
				},
				function (err, window) {
					var $ = window.jQuery;

					parseCode($, "body");
				}
			);
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
var parseLivre = function ($, livreElement) {};
var parseTitre = function ($, titreElement) {};
var parseChapitre = function ($, chapitreElement) {};
var parseSection = function ($, sectionElement) {};
var parseSousSection = function ($, sousSectionElement) {};
var parseParagraphe = function ($, paragrapheElement) {};

var requestArticle = function ($, articleUrl) {};
var parseArticle = function ($, articleElement) {};

console.log("web");
request(
	{
		uri: baseUrl + "initRechCodeArticle.do"
	},
	function (error, response, body) {
console.log("request");
		if (error && response.statusCode !== 200) {
			console.log("Error when contacting " + baseUrl);
		}

		jsdom.env(
			{
				html: body,
				scripts: [
					"http://code.jquery.com/jquery-1.6.min.js"
				]
			},
			function (err, window) {
console.log("jsdom");
				var $ = window.jQuery;

				var codeOptions = $("form[name=rechCodeArticleForm] span.selectCode select#champ1 option");
				console.log(codeOptions.length);

				var codes = [];

				codeOptions.each(
					function () {
						var title = $(this).attr("title");
						var value = $(this).attr("value");

						if (-1 === value.indexOf("LEGITEXT")) {
							return;
						}

						var url = baseUrl + "affichCode.do?cidTexte=" + value;
						codes.push(
							{
								title: title,
								url: url
							}
						);

						requestCode($, url);
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
	}
);
