var express = require('express');
var router = express.Router();
const uid2 = require('uid2');
const Users = require('../models/user');
const orders = require('../models/orders');

router.post('/', async (req, res) => {
	try {
		const { token, idJob, idJobTask /*status, price, idAddress */ } = req.body;
		let date = req.body.date;
		if (!date) {
			date = new Date();
		}

		if (token && idJob && idJobTask && date /*&& status && price && IdAddress */) {
			Users.findOne({ token: token }).then(async (findedUser) => {
				console.log(findedUser._id);
				if (findedUser) {
					const newOrders = new orders({
						idUser: findedUser._id,
						idJob: idJob,
						// idPro: null,
						idJobTask: idJobTask,
						Date: date,
						status: false, // Pour l'instant en dur
						price: 100, // Pour l'instant en dur
						IdAddress: '65e5ec8fa7d7b53b75681b38' // Pour l'instant en dur
					});

					// Enregistre la nouvelle commande
					const data = await newOrders.save();

					const user = await Users.findOne({ token: token });

					// Si l'utilisateur est trouvé, met à jour isOnService à true, sinon à false
					if (user) {
						Users.updateOne({ token: token }, { idOrder: data._id }).then((data) => {
							console.log('data : ', data);
						});
						// console.log(user);
						// await user.save();
					} else {
						// Si l'utilisateur n'est pas trouvé, renvoie une réponse avec isOnService à false
						res.json({ result: false, message: 'Utilisateur non trouvé' });
						return;
					}

					// Renvoie une réponse avec isOnService à true
					res.json({ result: true, data: data });
				} else {
					res.json({ result: false, error: 'No user with this token' });
				}
			});
		} else {
			// Si des champs requis manquent, renvoie une réponse avec isOnService à false
			res.json({ result: false, message: 'Champs requis manquants' });
		}
	} catch (error) {
		console.error(error);
		res.json({ result: false, message: 'Erreur' });
	}
});

router.get('/getIdAddress/:idOrder', (req, res) => {
	const idOrder = req.params.idOrder;
	const test = '65eb3e887942b0cc296213b0';
	console.log(test == idOrder);
	console.log(test, idOrder);
	console.log('params : ', typeof req.params.idOrder);
	orders
		.findOne({ _id: idOrder })
		.then((data) => {
			console.log('idOrder : ', data);
			if (data) {
				res.json({ result: true, IdAddress: data.IdAddress });
			}

			// Utilisez la propriété IdAddress du document retourné
		})
		.catch((error) => {
			console.error('Error while fetching IdAddress:', error);
			res.status(500).json({ result: false, error: 'Internal server error' });
		});
});

// isProFinded
router.get('/isProFinded/:idOrder', (req, res) => {
	orders.findOne({ _id: req.params.idOrder }).then((data) => {
		if (data.idPro) {
			res.json({ result: true });
		} else {
			res.json({ result: false });
		}
		console.log(data);
		// if(data)
	});
});
module.exports = router;
