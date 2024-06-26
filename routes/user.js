var express = require('express');
var router = express.Router();

const User = require('../models/user');
const Orders = require('../models/orders');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');
const uniqid = require('uniqid');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const geolib = require('geolib');
const Order = require('../models/orders');
const { result } = require('lodash');

// const { map } = require('lodash');

router.post('/upload', async (req, res) => {
	const pdfPaths = [];
	// console.log(req.files['selectionPDF']);
	try {
		// Itérer sur tous les fichiers dans la requête
		for (let i = 1; i <= 3; i++) {
			// console.log(req.files[`selectionPDF${i}`]);
			const pdfPath = `./tmp/${uniqid()}.pdf`;
			const resultMove = await req.files[`selectionPDF${i}`].mv(pdfPath);



			if (!resultMove) {
				pdfPaths.push(pdfPath);
			} else {
				// Si le déplacement du fichier échoue, annulez l'opération
				throw new Error(resultMove);
			}
		}

		// Uploader tous les fichiers sur Cloudinary
		const uploadPromises = pdfPaths.map(async (path) => {
			const resultCloudinary = await cloudinary.uploader.upload(path);
			return resultCloudinary.secure_url;
		});

		// Attendre que toutes les opérations d'upload soient terminées
		const uploadedUrls = await Promise.all(uploadPromises);

		// Supprimer les fichiers locaux après l'upload
		pdfPaths.forEach((path) => fs.unlinkSync(path));

		res.json({ result: true, urls: uploadedUrls });
	} catch (error) {
		// Gérer les erreurs
		res.json({ result: false, error: error.message });
	}
});

// route qui permet l'inscription d'un particulier
router.post('/signup', (req, res) => {

	if (!checkBody(req.body, ['firstName', 'lastName', 'email', 'password',])) {
		res.json({ result: false, error: 'Missing or empty fields' });
		return;
	}

	// Vérifiez si l'utilisateur n'est pas déjà enregistré
	User.findOne({ email: req.body.email }).then(data => {
		// console.log(data);
		if (data === null) {
			const hash = bcrypt.hashSync(req.body.password, 10);

			const newUser = new User({
				firstName: req.body.firstName,
				lastName: req.body.lastName,
				email: req.body.email,
				password: hash,
				isPro: req.body.isPro,
				token: uid2(32),
				rating: [],
				professionalInfo: req.body.isPro ? {
					// Les champs spécifiques au professionnel à partir du corps de la requête
					company_name: req.body.company_name,
					description: req.body.description,
					specialities: req.body.specialities,
					kbis: req.body.kbis,
					insurance_certificate: req.body.insurance,
					rib: req.body.rib,
					isOnline: false,
					disponibilities: [],
					money: 0
					// position: {latitude : null, longitude: null}
				} : null,
			});

			newUser.save().then(newDoc => {
				res.json({ result: true, token: newDoc.token });
			});
		} else {
			// L'utilisateur existe déjà dans la base de données
			// console.log('user already exist');
			res.json({ result: false, error: 'User already exists' });
		}
	});
});

router.get('/testAlreadyExist/:email', async (req, res) => {
	const email = req.params.email
	try {
		const user = await User.findOne({ email: email })

		if (user) {
			res.json({ result: false, error: 'User already exist' })
		} else {
			res.json({ result: true })
		}

	} catch (error) {
		// console.log(error);
		res.json({ error: error })
	}

})
//route qui permet la connection d'un particulier
router.post('/signin', (req, res) => {
	if (!checkBody(req.body, ['email', 'password'])) {
		res.json({ result: false, error: 'Missing or empty fields' });
		return;
	}

	User.findOne({ email: req.body.email }).then(data => {
		if (data && bcrypt.compareSync(req.body.password, data.password)) {
			res.json({ result: true, token: data.token, isPro: data.isPro });
		} else {
			res.json({ result: false, error: 'User not found or wrong password' });
		}
	});
});

router.put('/changeIsOnline/:idUser', async (req, res) => {
	try {
		const professionalId = req.params.idUser;
		const user = await User.findOne({ _id: professionalId });

		if (!user) {
			return res.json({ result: false, error: 'Utilisateur non trouvé' });
		}

		// Inverse la valeur de isOnline
		user.isOnline = !user.isOnline;
		await user.save();

		res.json({ result: true, user });
	} catch (error) {
		console.error('Erreur lors de la mise à jour :', error);
		res.status(500).json({ result: false, error: 'Erreur serveur' });
	}
});

router.post('/signin', (req, res) => {
	if (!checkBody(req.body, ['email', 'password'])) {
		res.json({ result: false, error: 'Missing or empty fields' });
		return;
	}

	User.findOne({ email: req.body.email }).then((data) => {
		if (data && bcrypt.compareSync(req.body.password, data.password)) {
			res.json({ result: true, token: data.token, isPro: data.isPro });
		} else {
			res.json({ result: false, error: 'User not found or wrong password' });
		}
	});
});

// Rechercher la position de tout les utilisateurs en ligne
// Renvoyer l'utilisateur le plus proche de la position

router.get('/findUserNearbyAndGiveOrder/:lat/:long/:idOrder', async (req, res) => {
	const locationOrder = { latitude: req.params.lat, longitude: req.params.long };
	const idOrder = req.params.idOrder;

	try {
		// Récupérer tous les utilisateurs en ligne depuis la base de données
		const usersOnline = await User.find({ 'professionalInfo.isOnline': true });
		let closestUser = null;
		let minDistance = Infinity;

		// Boucle sur chaque utilisateur
		usersOnline.forEach((user) => {
			// Calculer la distance entre l'utilisateur et la position de la commande
			const distance = geolib.getDistance(user.professionalInfo.position, locationOrder);
			const distanceInKilometers = geolib.convertDistance(distance, 'km');

			// Mettre à jour l'utilisateur le plus proche
			if (distance < minDistance && distanceInKilometers && user.professionalInfo.rejectedOrders.includes(idOrder) === false) {
				closestUser = user;
				minDistance = distanceInKilometers;
			}
		});

		// Renvoyer l'ID de l'utilisateur le plus proche
		if (closestUser) {
			// Upload l'odrer pour ui attribuer le pro trouvé
			Orders.updateOne({ _id: idOrder }, { requestIdPro: closestUser._id }).then(
				User.updateOne({ _id: closestUser._id }, { 'professionalInfo.requestIdOrder': idOrder }).then(
					res.json({ result: true, message: `User ${closestUser._id} trouvé, il doit accepter ou refuser la commande` })
				)
			);
		} else {
			res.json({ message: 'Aucun utilisateur trouvé.' });
		}
	} catch (error) {
		console.error("Erreur lors de la recherche de l'utilisateur le plus proche :", error);
		res.status(500).json({ error: 'Erreur interne du serveur.' });
	}
});

// Verifie si le pro a accepter une commande
router.get('/checkIfProAcceptOrder/:token', async (req, res) => {
	try {
		const token = req.params.token

		const user = await User.findOne({ token: token })

		if (!user) {
			return res.json({ result: false, error: "Pas de user avec se token" })
		}

		const order = await Order.findOne({ _id: user.idOrder })

		if (!order) {
			return res.json({ result: false, error: "Pas de order avec cette id" })
		}

		const pro = await User.findOne({ _id: order.requestIdPro })

		if (!pro) {
			return res.json({ result: false, error: "Pas de pro avec cette id" })
		}

		const proInfo = {
			idPro: pro._id,
			firstName: pro.firstName,
			position: pro.professionalInfo.position,
			company_name: pro.professionalInfo.company_name
		}

		if (order.idPro || undefined) {
			return res.json({ result: true, proInfo: proInfo, error: "L'utilisateur a accepté la commande" })
		} else {
			return res.json({ result: false, error: "L'utilisateur n'a pas encore accepté la commande" })

		}

	} catch (error) {
		console.error(error);
		return res.status(500).json({ result: false, message: 'Erreur lors du check du pro' })
	}
})

// Passe le pro en ligne/hors ligne
router.put('/changeIsOnline', async (req, res) => {
	try {
		const token = req.body.token;
		const user = await User.findOne({ token: token });

		if (!user) {
			return res.json({ result: false, error: 'Utilisateur non trouvé' });
		}

		// Inverse la valeur de isOnline
		user.professionalInfo.isOnline = !user.professionalInfo.isOnline;
		await user.save();

		res.json({ result: true, user });
	} catch (error) {
		console.error('Erreur lors de la mise à jour :', error);
		res.status(500).json({ result: false, error: 'Erreur serveur' });
	}
});

// Recupere la propriete isOnline du pro grace a son token
router.get('/isOnline/:token', async (req, res) => {
	// Chercher le user
	const token = req.params.token;
	try {
		const user = await User.findOne({ token: token });

		if (!user) {
			return res.json({ result: false, error: 'Utilisateur non trouvé' });
		}

		res.json({ result: true, isOnline: user.professionalInfo.isOnline });
	} catch (error) {
		console.error('Erreur lors de la mise à jour :', error);
		res.status(500).json({ result: false, error: 'Erreur serveur' });
	}
	// Renvoyer la reponse isOnline
});

// Recuperer le isOnService du user grace a un id

router.get('/getIsOnService/:idUser', async (req, res) => {
	try {
		const user = await User.findOne({ _id: req.params.idUser });

		if (!user) {
			return res.json({ result: false, error: 'User non trouvé' });
		}

		res.json({ result: true, isOnService: user.isOnService });
	} catch (error) { }
});

router.get('/checkIfOrderRequest/:token', (req, res) => {

	try {
		User.findOne({ token: req.params.token })
			.then(dataUser => {
				if (dataUser && dataUser.professionalInfo.isOnline === true) {
					// Si il a reçu une requete est si idOrder n'est pas vide(ça veut dire qu'il n'a pas validé de commande)
					if ((dataUser.professionalInfo.requestIdOrder !== null || dataUser.professionalInfo.requestIdOrder !== undefined) && dataUser.idOrder == null) {
						Order.findOne({ _id: dataUser.professionalInfo.requestIdOrder, status: false })
							.then(dataOrder => {

								if (!dataOrder) {
									return res.json({ result: false, message: "Il n'y a pas encore de commande pour vous" })
								}

								const allJob = dataOrder.idJob.map(e => {
									return e.name
								})

								const allTask = dataOrder.idJobTask.map(e => {
									return e.name
								})

								const orderObject = {
									job: allJob,
									idTask: allTask,
									idAddress: dataOrder.IdAddress,
									price: dataOrder.price
								}
								res.json({ result: true, proGetOrder: true, order: orderObject })
							})
					} else {
						res.json({ result: true, proGetOrder: false })
					}
				} else {
					res.json({ result: false, error: 'user not found or not connected' });
				}
			}
			)
	} catch (error) {
		console.error('Erreur lors de la mise à jour :', error);
		res.status(500).json({ result: false, error: 'Erreur serveur' });
	}
})

router.post('/refuseOrder/:token', async (req, res) => {
	const token = req.params.token;

	try {
		// Rechercher l'utilisateur par son token
		const user = await User.findOne({ token: token });

		if (user) {
			// Rechercher la commande de l'utilisateur
			const order = await Order.findOne({ _id: user.professionalInfo.requestIdOrder });

			if (order) {
				// Supprimer l'ID du professionnel associé à la commande
				await Order.updateOne({ _id: order._id }, { $unset: { idPro: 1 } });

				// Supprimer l'ID de la commande de l'utilisateur
				await User.updateOne({ token: token }, { $unset: { 'professionalInfo.requestIdOrder': 1 } });

				// Ajouter l'ID de la commande refusée aux ordres refusés de l'utilisateur
				await User.updateOne({ token: token }, { $push: { 'professionalInfo.rejectedOrders': order._id } });

				res.json({ result: true, message: 'La commande a été refusée avec succès.' });
			} else {
				res.json({ result: false, error: 'Commande de l\'utilisateur non trouvée.' });
			}
		} else {
			res.json({ result: false, error: 'Utilisateur non trouvé par le token.' });
		}
	} catch (error) {
		res.status(500).json({ result: false, error: error.message });
	}
});

router.post('/acceptOrder/:token', async (req, res) => {
	const token = req.params.token;

	try {
		// Rechercher l'utilisateur par son token
		const user = await User.findOne({ token: token });

		if (user) {
			// Rechercher la commande de l'utilisateur
			const order = await Order.findOne({ _id: user.professionalInfo.requestIdOrder });

			if (order) {
				// Mettre requestIdPro de order a idPro sur ORDER pour dire au client qu'il a validé
				await Order.updateOne({ _id: order._id }, { idPro: user._id });

				// Mettre requestIdPro de user a idOrder sur le USER pour validé la commande
				await User.updateOne({ token: token }, { idOrder: user.professionalInfo.requestIdOrder });

				res.json({ result: true, message: 'La commande a été accepté !' });
			} else {
				res.json({ result: false, error: 'La commande a du être annulée...' });
			}
		} else {
			res.json({ result: false, error: 'Utilisateur non trouvé par le token.' });
		}
	} catch (error) {
		res.status(500).json({ result: false, error: error.message });
	}
})

// Savoir si le pro ou le particulier a une commande en cours
router.get('/isOnOrder/:token', async (req, res) => {
	const token = req.params.token;

	// Vérifier si le token est présent
	if (!token) {
		return res.status(400).json({ result: false, error: "Le token est manquant" });
	}

	try {
		const user = await User.findOne({ token: token });

		if (!user) {
			return res.json({ result: false, error: "L'utilisateur n'a pas été trouvé" });
		}

		const order = await Order.findOne({ _id: user.idOrder, status: false });

		if (!order) {
			return res.json({ result: false, error: "L'utilisateur n'a pas de commande ou n'en a pas accepté" });
		} else {
			return res.json({ result: true, order: order });
		}
	} catch (error) {
		return res.status(500).json({ result: false, error: error.message });
	}
});

// Obtenir un user grace a un token
router.get('/getUser/:token', async (req, res) => {
	const token = req.params.token
	try {
		console.log('yo');
		const user = await User.findOne({ token: token })

		if (!user) {
			res.json({ result: false, error: 'User not find' })
		} else {
			const allRating = user.rating.map(rate => {
				return rate.rate
			})

			let average = 0;

			for (let i = 0; i < allRating.length; i++) {
				average += allRating[i]
			}

			average = average / allRating.length

			if (user.isPro) {
				res.json({ result: true, firstName: user.firstName, lastName: user.lastName, average: average, money: user.professionalInfo.money })
			} else {
				res.json({ result: true, firstName: user.firstName, lastName: user.lastName, average: average })
			}
		}


	} catch (error) {
		console.log(error);
		res.json({ result: false, error })
	}
})

// Obtenir un user grace a un id
router.get('/getUserById/:idUser', async (req, res) => {
	const idUser = req.params.idUser
	try {
		console.log('yo');
		const user = await User.findOne({ _id: idUser })

		if (!user) {
			res.json({ result: false, error: 'User not find' })
		} else {
			const allRating = user.rating.map(rate => {
				return rate.rate
			})

			let average = 0;

			for (let i = 0; i < allRating.length; i++) {
				average += allRating[i]
			}

			average = average / allRating.length

			if (user.isPro) {
				res.json({ result: true, firstName: user.firstName, lastName: user.lastName, average: average, money: user.professionalInfo.money })
			} else {
				res.json({ result: true, firstName: user.firstName, lastName: user.lastName, average: average })
			}
		}


	} catch (error) {
		console.log(error);
		res.json({ result: false, error })
	}
})

router.put('/refreshLocation/:token', async (req, res) => {
	const token = req.params.token
	const { latitude, longitude } = req.body

	try {
		const user = await User.findOne({ token: token })

		if (!user) {
			res.json({ result: false, error: 'User not found' })
		} else {
			const userUpdated = await User.updateOne({ token: token }, { 'professionalInfo.position.latitude': latitude, 'professionalInfo.position.longitude': longitude })
			res.json({ result: true, message: 'position updated', user: userUpdated })
		}

	} catch (error) {
		res.json({ result: false, error })
	}
})

router.get('/getPositionOfPro/:userId', async (req, res) => {
	try {
		const user = await User.findById(req.params.userId);

		if (!user) {
			return res.status(404).json({ error: "Utilisateur non trouvé" });
		}

		if (!user.isPro) {
			return res.status(400).json({ error: "Cet utilisateur n'est pas un professionnel" });
		}

		if (!user.professionalInfo.position) {
			return res.status(400).json({ error: "La position du professionnel n'est pas définie" });
		}

		const { latitude, longitude } = user.professionalInfo.position;
		res.json({ result: true, latitude, longitude });
	} catch (error) {
		console.error("Erreur lors de la récupération de la position du professionnel :", error);
		res.status(500).json({ error: "Erreur interne du serveur" });
	}
});



// router
module.exports = router;
