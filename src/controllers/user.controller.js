const db = require("../models");
const User = db.User;
const bcrypt = require("bcrypt");
const datatable = require(`sequelize-datatables`);

exports.findDataTable = (req, res) => {
  // req.body = {
  //   draw: "1",
  //   columns: [
  //     {
  //       data: "full_name",
  //       name: "",
  //       searchable: "true",
  //       orderable: "true",
  //       search: {
  //         value: "",
  //         regex: "false",
  //       },
  //     },
  //   ],
  //   order: [
  //     {
  //       column: "0",
  //       dir: "asc",
  //     },
  //   ],
  //   start: "0",
  //   length: "10",
  //   search: {
  //     value: "",
  //     regex: "false",
  //   },
  //   _: "1478912938246",
  // };

  datatable(User, req.body).then((result) => {
    // result is response for datatables
    res.json(result);
  });
};

// Create and Save a new User
exports.create = async (req, res) => {
  req.body.full_name = "";

  req.body.created_by = req.user.id;

  req.body.password = await bcrypt.hash(
    req.body.password,
    parseInt(process.env.SALT_ROUND)
  );

  User.create(req.body)
    .then((data) => {
      User.findByPk(data.id, { include: ["created"] }).then((result) => {
        res.send({
          error: false,
          data: result,
          message: ["User is created successfully."],
        });
      });
    })
    .catch((err) => {
      res.status(500).send({
        error: true,
        data: [],
        message: err.errors.map((e) => e.message),
      });
    });
};

// Retrieve all User from the database.
exports.findAll = (req, res) => {
  User.findAll({ where: { status: "Active" } })
    .then((data) => {
      res.send({
        error: false,
        data: data,
        message: ["Retrieved successfully."],
      });
    })
    .catch((err) => {
      res.status(500).send({
        error: true,
        data: [],
        message: err.errors.map((e) => e.message),
      });
    });
};

// Find a single User with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  User.findByPk(id)
    .then((data) => {
      res.send({
        error: false,
        data: data,
        message: [process.env.SUCCESS_RETRIEVED],
      });
    })
    .catch((err) => {
      res.status(500).send({
        error: true,
        data: [],
        message:
          err.errors.map((e) => e.message) || process.env.GENERAL_ERROR_MSG,
      });
    });

  // or you can use find one
  // User.findOne({ where: { id: id, status = 'Active' } })
  //   .then((data) => {
  //     res.send({
  //       error: false,
  //       data: data,
  //       message: [process.env.SUCCESS_RETRIEVED],
  //     });
  //   })
  //   .catch((err) => {
  //     res.status(500).send({
  //       error: true,
  //       data: [],
  //       message:
  //         err.errors.map((e) => e.message) || process.env.GENERAL_ERROR_MSG,
  //     });
  //   });
};

// Update a User by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;

  req.body.full_name = "";

  if (req.body.password) {
    req.body.password = await bcrypt.hash(
      req.body.password,
      parseInt(process.env.SALT_ROUNDS)
    );
  }

  User.update(req.body, {
    where: { id: id },
  })
    .then((result) => {
      console.log(result);
      if (result) {
        // success
        User.findByPk(id).then((data) => {
          res.send({
            error: false,
            data: data,
            message: [process.env.SUCCESS_UPDATE],
          });
        });
      } else {
        // error in updating
        res.status(500).send({
          error: true,
          data: [],
          message: ["Error in updating a record"],
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        error: true,
        data: [],
        message:
          err.errors.map((e) => e.message) || process.env.GENERAL_ERROR_MSG,
      });
    });
};

// Delete a User with the specified id in the request
exports.delete = (req, res) => {
  // update of user status
  const id = req.params.id;
  const body = { status: "Inactive" };

  User.update(body, {
    where: { id: id },
  })
    .then((result) => {
      if (result) {
        // success
        User.findByPk(id).then((data) => {
          res.send({
            error: false,
            data: data,
            message: [process.env.SUCCESS_UPDATE],
          });
        });
      } else {
        // error in updating
        res.status(500).send({
          error: true,
          data: [],
          message: ["Error in updating a record"],
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        error: true,
        data: [],
        message:
          err.errors.map((e) => e.message) || process.env.GENERAL_ERROR_MSG,
      });
    });
};
