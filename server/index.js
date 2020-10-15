'use strict';
const mysql = require('mysql');
const express = require('express');
const path = require('path');
const app = express();
const { Sequelize, DataTypes } = require('sequelize');
const Op = Sequelize.Op;
const env = process.env.NODE_ENV || 'development';
const config = {
  "development": {
    "username": "root",
    "password": "Vendit0730",
    "database": "library",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}[env];

let http = require('http');
let bodyParser = require('body-parser');
let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const books = sequelize.define('books', {
  title: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  content: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  // Other model options go here
});

// 한번만 실행
sequelize.sync({ force: false }).then( () => {
  console.log("db 연결 완료");
  
}).catch(err => {
  console.log("db 연결 실패");
  console.log(err);
});


app.set('views', '../');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

app.get('/', async(req, res) => { 
  await books.findAll().then(result => {
    res.json(result)
    res.render('index', {
      list : result
    });
  });
});



app.post('/inputBook', async (req, res) => {
  await books.create({
    title : req.body.title,
    content : req.body.content,
    author : req.body.author,
    date : req.body.date
  }).then(result => {
    console.log("success input data" + result);
    res.redirect('/');
  }).catch(err => {
    console.log("fail update data" + err);
  });
});

app.post('/edit/:id', async(req, res) => {
  await books.update({
    title : req.body.title,
    content : req.body.content,
    author : req.body.author,
    date : req.body.date
  }, {
    where : {id: req.params.id}
  }).then(result => {
    console.log("success update data" + result);
    res.redirect('/');
  }).catch(err => {
    console.log("fail update data" + err)
  })
})

app.get('/delete/:id', async(req, res) => {
  await books.destroy({
    where: {id: req.params.id}
  }).then(result => {
    console.log(result)
    res.redirect('/');
  }).catch(err => {
    console.log("데이터 삭제" + err);
  });
});

app.post('/find', async(req, res) => {
  let searchInput = req.body.searchInput;
  let dateStart = req.body.dateStart;
  let dateEnd = req.body.dateEnd;
  await books.findAll({
    where : {
      [Op.or]: [
        {
          title : {
            [Op.like]:"%" + searchInput + "%"
          }
        },
        {
          content : {
            [Op.like]:"%" + searchInput + "%"
          }
        },
        {
          author : {
          [Op.like]:"%" + searchInput + "%"
          }
        },
        {
          date : {
          [Op.between]: [new Date(dateStart), new Date(dateEnd)]
          }
        }
      ]
    }
  }).then(result => {
    res.render('index', {list: result})
  })
});

http.createServer(app).listen(3000, () => {'Server is running on port 3000...'})