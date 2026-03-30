const Reservation = require("../models/reservation");

exports.getReservations = async (req, res, next) => {
  try {
    const filter = req.user?.id ? { user: req.user.id } : {};
    const reservations = await Reservation.find(filter).sort({ date: 1 });
    res.json(reservations);
  } catch (err) {
    next(err);
  }
};

exports.createReservation = async (req, res, next) => {
  try {
    const { service, date, notes } = req.body;
    if (!service || !date) {
      return res
        .status(400)
        .json({ message: "Service and date are required" });
    }

    const reservation = await Reservation.create({
      user: req.user?.id,
      service,
      date,
      notes,
    });

    res.status(201).json(reservation);
  } catch (err) {
    next(err);
  }
};
