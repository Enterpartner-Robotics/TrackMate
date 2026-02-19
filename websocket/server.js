// server.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const bodyParser = require('body-parser');
const io = require('socket.io')(http, {
  cors: {
    origin: "*",  // Ha szükséges, pontosítsd az engedélyezett domaineket
    methods: ["GET", "POST"]
  }
});

// Body parser beállítása az érkező JSON adatokhoz
app.use(bodyParser.json());

// HTTP végpont, amire a PHP backend küldheti az adatbázis módosításokról szóló értesítést
app.post('/new-data', (req, res) => {
  const newData = req.body;
  console.log('Új adat érkezett:', newData);
  // Broadcast az összes csatlakozott kliensnek
  if(newData.update == 'raktar_tabla'){
        io.emit('update_raktar_tabla', { update: 'raktar_tabla' });
  }
  if(newData.update == 'aru_tabla'){
    io.emit('update_aru_tabla', { update: 'aru_tabla' });
  }
  if(newData.update == 'jog_tabla'){
    io.emit('update_jog_tabla', { update: 'jog_tabla' });
  }
  if(newData.update == 'munkalap_chat'){
    io.emit('update_munkalap_chat', { update: 'munkalap_chat', munkalap_id: newData.munkalap_id });
  }
  if(newData.update == 'munkalap_baloldal'){
    io.emit('update_munkalap_baloldal', { update: 'munkalap_baloldal'});
  }
  if(newData.update == 'munkalap_jobboldal'){
    io.emit('update_munkalap_jobboldal', { update: 'munkalap_jobboldal', munkalap_id: newData.munkalap_id });
  }
  if(newData.update == 'dokumentumtar_jobboldal'){
    io.emit('update_dokumentumtar_jobboldal', { update: 'dokumentumtar_jobboldal'});
  }
  if(newData.update == 'kategoria_baloldal'){
    io.emit('update_kategoria_baloldal', { update: 'kategoria_baloldal'});
  }
  res.send({ status: 'ok' });
});

// Socket.io kapcsolat kezelése
io.on('connection', (socket) => {
  console.log('Új kliens csatlakozott: ' + socket.id);

  socket.on('disconnect', () => {
    console.log('Kliens bontotta a kapcsolatot: ' + socket.id);
  });
});

// A szerver indítása a 3000-es porton (vagy tetszőleges porton)
http.listen(8081, () => {
  console.log('Socket.IO szerver fut a 8081-es porton');
});
