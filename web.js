var request = require("request");
var jsdom = require("jsdom");
var express = require("express");
var fs = require("fs");

var app = express(express.logger());
app.use(express.bodyParser());

app.get(
	"/",
	function(req, res) {

		request(
			{
				uri:'http://www.legifrance.gouv.fr/affichCode.do?cidTexte=LEGITEXT000006070721'
			},
			function (error, response, body) {
				if (error && response.statusCode !== 200) {
					console.log("Error when contacting legifrance.gouv.fr");
				}

				jsdom.env(
					{
						html: body,
						scripts: [
							"http://code.jquery.com/jquery-1.5.min.js"
						]
					},
					function (err, window) {
						var $ = window.jQuery;

						// GET VERSION
						var version = $("#titreTexte .sousTitreTexte").text().substr(26).split(" ");
						var output = version[0] + version[1] + version[2];

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

						res.send(output);
					}
				);
			}
		);
	}
);

var port = process.env.PORT || 3000;
app.listen(port, function() {
	console.log("Listening on " + port);
});
