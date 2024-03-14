var express = require('express');
var router = express.Router();
const uid2 = require('uid2');
const Users = require('../models/user');
const orders = require('../models/orders');
const Order = require('../models/orders');
const User = require('../models/user');

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

router.delete('/delete/:idOrder', async (req, res) => {
	const idOrder = req.params.idOrder
	try {
		const order = await orders.findOne({ _id: idOrder })

		if (!order) {
			res.json({ result: false, error: "La commande n'a pas été trouvé" })
		}

		const user = await User.findOne({ _id: order.idUser })

		if (!user) {
			res.json({ result: false, error: "L'utilisateur n'a pas été trouvé ou n'a pas de commande" })
		}

		user.idOrder = null; // Supprimer la commande sur le user qui a passé la commande
		await user.save();

		const pro = await User.findOne({ 'professionalInfo.requestIdOrder': order._id })

		console.log('pro info : ', pro.professionalInfo.requestIdOrder);
		pro.professionalInfo.requestIdOrder = null; // Supprimer la commande sur le pro qui a potentiellement reçu la commande

		await pro.save();

		// if(order.)
		const deletedOrder = await Order.deleteOne({ _id: idOrder }); // Supprime la commande dans la table order

		if (deletedOrder.deletedCount === 0) {
			return res.json({ result: false, error: "La commande n'a pas été trouvée ou n'a pas été supprimée" });
		}

		res.json({ result: true, message: "La commande a bien été supprimé !" })
	} catch (error) {
		console.error("Erreur lors de la suppression de la commande :", error);
		res.status(500).json({ result: false, error: "Erreur interne du serveur" });
	}
})

router.put('/proEndOrder/:token', async (req, res) => {
	const { token, idOrder } = req.params

	try {
		const user = await User.findOne({ token: token })

		if (!user) {
			return res.json({ result: false, error: "L'utilisateur n'a pas été trouvé " })
		}

		if (user.isPro !== true) {
			return res.json({ result: false, error: "L'utilisateur n'est pas un pro " })
		}

		const order = await Order.findOne({ _id: user.idOrder })

		if (!order) {
			return res.json({ result: false, error: "La commande n'a pas été trouvé" })
		}

		const consummer = await User.findOne({ idOrder: order._id })




		if (user._id.toString() !== order.idPro.toString()) {
			return res.json({ result: false, error: "Vous n'avez pas le droit de mettre fin a cette commande" })
		}

		order.status = true
		user.idOrder = null
		user.professionalInfo.requestIdOrder = null
		consummer.idOrder = null
		await order.save()
		await user.save()
		await consummer.save()

		return res.json({ result: true, message: 'Statut de la commande mis à jour avec succès' });
	} catch (error) {
		console.error("Erreur lors de finalisation de la commande :", error);
		return res.status(500).json({ result: false, error: "Erreur interne du serveur" });
	}
})
// Recup une addresse a partir de un idAddress
// router

// Recup un user a partir d'un idUser
module.exports = router;
