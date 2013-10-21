var jsdom = require("jsdom"),
	fs = require("fs"),
	moment = require("moment");


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
			"janvier": 0,
			"fevrier": 1,
			"mars": 2,
			"avril": 3,
			"mai": 4,
			"juin": 5,
			"juillet": 6,
			"aout": 7,
			"septembre": 8,
			"octobre": 9,
			"novembre": 10,
			"decembre": 11
		};

	return months[monthStringWithoutAccents];
};

var findRomanNumeral = function (stringContainingRomanNumeral) {};
var convertRomanNumeralToArabicNumeral = function (romanNumeral) {};


// SECTION
var parseSection = function (object, section) {
	if (!section || (section.length === 0)) {
		return;
	}

	var subsection = section.children("li.noType");

	if (!subsection || (subsection.length === 0)) {
		return;
	}

	object.names = object.names || [];

	var name = subsection.children("span").first().text();
	console.log(name);
	object.names.push(name);

	// Go deeper one level
	object.sections = parseSection({}, subsection.children("ul.noType").first());

	// Go to next sibling
	parseSection(object, section.next());

	return object;
};


var requestArticle = function (articleUrl) {};
var parseArticle = function (articleElement) {};


// CODE
var parseDate = function (dateString) {
	var date = dateString.split(" ");

	if (6 !== date.length) {
		return;
	}

	return moment(new Date(date[5], replaceMonthStringByMonthIndex(date[4]), date[3]));
};

var parseCode = function ($, codeElement, index, href) {
	var fullText = $(codeElement).find("#titreTexte").text(),
		title = fullText.substr(0, fullText.indexOf("Version consolidée au")).trim(),
		date = parseDate($(codeElement).find("#titreTexte .sousTitreTexte").text().trim());

	if (!date || !date.isValid()) {
		console.log("ERROR - Date invalid for title '" + title + "' of full text '" + fullText + "' with id '" + index + "'");
		return;
	}

	var section = $(codeElement).find("div.data").children("ul.noType").first();
	var object = parseSection({}, section);

	var codeData = {
		id: index,
		name: title,
		modified: date,
		sections: object
	}

	fs.writeFile(
		href,
		JSON.stringify({ code: codeData }),
		function (error) {
			if (error) {
				console.log("ERROR - Could not save file '" + href + "', see error below.");
				console.log(error);
			}
			else {
				console.log("SUCCESS - The file '" + href + "' was saved!");
			}
		}
	);
};

var requestCode = function (codeUrl, index, href) {
	jsdom.env(
		codeUrl,
		["http://code.jquery.com/jquery-1.6.min.js"],
		function (errors, window) {
			var $ = window.jQuery;
			parseCode($, "body", index, href);
		}
	);
};


// CODES
var parseCodes = function ($, codeOptions) {
	var codes = [],
		index = 1;

	codeOptions.each(
		function () {
			var title = $(this).attr("title"),
				value = $(this).attr("value");

			// HACK: Just parse the first code
			// if (index > 1) {
			// 	return;
			// }

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

			var url = baseUrl + "affichCode.do?cidTexte=" + value;
			requestCode(url, index, href);

			index++;
		}
	);

	fs.writeFile(
		"codes.json",
		JSON.stringify({ codes: codes }),
		function (error) {
			if (error) {
				console.log("ERROR - Could not save file 'codes.json', see error below.");
				console.log(error);
			}
			else {
				console.log("SUCCESS - The file 'codes.json' was saved!");
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
