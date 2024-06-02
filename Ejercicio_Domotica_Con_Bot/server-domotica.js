import http from 'node:http';
import { join } from 'node:path';
import { readFile } from 'node:fs';
import { Server } from 'socket.io';
import { MongoClient } from 'mongodb';

// Rutas
const raiz = '/';
const favicon = '/favicon.ico';

const httpServer = http.createServer((request, response) => {

    let { url } = request; // De la petición HTTP, obtenemos la URL

    if (request.method == 'GET') {

        switch (url) {

            case raiz:

                url = '/cliente-domotica.html';
                const mandarCliente = join(process.cwd(), url);

                readFile(mandarCliente, (err, data) => {
                    if (!err) {
                        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                        response.write(data);
                    } else {
                        response.writeHead(500, { 'Content-Type': 'text/plain' });
                        response.write(`Error interno del servidor en la lectura del fichero: ${url}, Error: ${err}`);
                    }
                    response.end();
                });

                break;

            case favicon:

                url = '/favicon.ico';

                const mandarFavicon = join(process.cwd(), url);

                readFile(mandarFavicon, (err, data) => {

                    if (!err) {
                        response.writeHead(200, { 'Content-Type': 'image/x-icon' });
                        response.write(data);
                    }
                    else {
                        response.writeHead(500, { 'Content-Type': 'text/plain' });
                        response.write(`Error interno del servidor en la lectura del fichero: ${url}, Error: ${err}`);
                    }
                    response.end();
                });

                break;

            default:

                console.log('La petición enviada es: ' + url + ' y no se puede resolver en este momento.');
                response.writeHead(404, { 'Content-Type': 'text/plain' });
                response.write('404 Not Found ; La peticion enviada no puede ser resuelta en este momento.\n');
                response.end();

                break;
        }

    } else {

        console.log('La petición enviada es: ' + url + ' y no se puede resolver en este momento.');
        response.writeHead(404, { 'Content-Type': 'text/plain' });
        response.write('404 Not Found ; La peticion enviada no puede ser resuelta en este momento.\n');
        response.end();

    }

});

httpServer.listen(8080);

console.log('Servidor iniciado en el puerto 8080');

MongoClient.connect('mongodb://localhost:27017/').then((db) => {
    const dbo = db.db('DatosDomotica');
    const collection = dbo.collection('Datos');
    const collection2 = dbo.collection('Eventos');
    const collection3 = dbo.collection('Maximos');

    const io = new Server(httpServer);

    io.sockets.on('connection', (client) => {

        const clientType = client.handshake.query.clientType;

        collection3.find().sort({ $natural: -1 }).limit(1).toArray().then((dataUmbrales) => {
            io.sockets.emit('actualizarUmbrales', dataUmbrales[0]);
        }); // Se lo paso tanto al cliente como al agente

        if (clientType === 'agent') {
            console.log('AGENTE CONECTADO: ' + client.request.socket.remoteAddress + ' Y PUERTO : ' + client.request.socket.remotePort);
        } else {
            console.log('CLIENTE CONECTADO: ' + client.request.socket.remoteAddress + ' Y PUERTO : ' + client.request.socket.remotePort);
            collection.find().sort({ $natural: -1 }).limit(1).toArray().then((data) => { //Recoger los datos más recientes de la base de datos (último registro)
                io.sockets.emit('actualizarClienteEntrante', data[0]); // Para que los sensores estén actualizados
            });

            collection2.find({ evento: { $exists: true } }).sort({ $natural: -1 }).limit(10).toArray().then((dataEventos) => {
                io.sockets.emit('actualizarEventos', dataEventos); // Para que el cliente conozca los eventos pasados
            });
        }

        client.on('disconnect', () => {
            console.log('CLIENTE DESCONECTADO: ' + client.request.socket.remoteAddress + ' Y PUERTO : ' + client.request.socket.remotePort);
        });

        client.on('cambiarMaxTemp', (data) => {
            //Actualizar la última tupla insertada en base de datos 
            collection3.find().sort({ $natural: -1 }).limit(1).toArray().then((tupla) => {
                const update = {
                    $set: {
                        temperaturaMax: data.temp
                    }
                };
                collection3.updateOne({ _id: tupla[0]._id }, update).then(() => { });
            }).then(() => {

                collection3.find().sort({ $natural: -1 }).limit(1).toArray().then((result) => {
                io.sockets.emit('actualizarUmbrales', result[0]);

                });
            });
            
        });

        client.on('cambiarMinTemp', (data) => {
            //Actualizar la última tupla insertada en base de datos 
            collection3.find().sort({ $natural: -1 }).limit(1).toArray().then((tupla) => {
                const update = {
                    $set: {
                        temperaturaMin: data.temp
                    }
                };
                collection3.updateOne({ _id: tupla[0]._id }, update).then(() => { });
            }).then(() => {

                collection3.find().sort({ $natural: -1 }).limit(1).toArray().then((result) => {
                io.sockets.emit('actualizarUmbrales', result[0]);

                });
            });
            
        });

        client.on('cambiarMaxLuz', (data) => {
            //Actualizar la última tupla insertada en base de datos 
            collection3.find().sort({ $natural: -1 }).limit(1).toArray().then((tupla) => {
                const update = {
                    $set: {
                        luzMax: data.luz
                    }
                };
                collection3.updateOne({ _id: tupla[0]._id }, update).then(() => { });
            }).then(() => {

                collection3.find().sort({ $natural: -1 }).limit(1).toArray().then((result) => {
                io.sockets.emit('actualizarUmbrales', result[0]);

                });
            });
            
        });

        client.on('cambiarMaxViento', (data) => {
            //Actualizar la última tupla insertada en base de datos 
            collection3.find().sort({ $natural: -1 }).limit(1).toArray().then((tupla) => {
                const update = {
                    $set: {
                        vientoMax: data.viento
                    }
                };
                collection3.updateOne({ _id: tupla[0]._id }, update).then(() => { });
            }).then(() => {

                collection3.find().sort({ $natural: -1 }).limit(1).toArray().then((result) => {
                io.sockets.emit('actualizarUmbrales', result[0]);

                });
            });
            
        });

        client.on('insertarDatos', (data) => {

            console.log('Datos recibidos del cliente: ' + JSON.stringify(data));

            let promises = [];

            if (data.viento === "") {
                promises.push(collection.find().sort({ $natural: -1 }).limit(1).toArray().then((dataViento) => {
                    data.viento = dataViento[0].viento;
                }));
            }

            if (data.temperatura === "") {
                promises.push(collection.find().sort({ $natural: -1 }).limit(1).toArray().then((dataTemperatura) => {
                    data.temperatura = dataTemperatura[0].temperatura;
                }));
            }

            if (data.luminosidad === "") {
                promises.push(collection.find().sort({ $natural: -1 }).limit(1).toArray().then((dataLuminosidad) => {
                    data.luminosidad = dataLuminosidad[0].luminosidad;
                }));
            }

            Promise.all(promises).then(() => {
                collection.insertOne(data, { safe: true }).then(() => { });
                console.log('Datos insertados en la base de datos con éxito. Datos: ' + JSON.stringify(data));
                io.sockets.emit('actualizarSensores', data);
            });

        });

        /*client.on('actualizarSensores', () => {
            //Recoger los datos más recientes de la base de datos (último registro)
            console.log('ACTUALIZANDO SENSORES POR AGENTE');
            collection.find().sort({ $natural: -1 }).limit(1).toArray().then((data) => {
                client.emit('actualizarSensores', data);
            });
        });*/

        client.on('actualizarActuadores', (data) => { // Recibe los datos del agente
            console.log('ACTUALIZANDO ACTUADORES POR AGENTE');
            //Actualizar la última tupla insertada en base da datos con los datos de los actuadores
            collection.find().sort({ $natural: -1 }).limit(1).toArray().then((dataActuadores) => {
                const update = {
                    $set: {
                        estadoAC: data.estadoAC,
                        estadoPersiana: data.estadoPersiana,
                        estadoToldo: data.estadoToldo
                    }
                };
                collection.updateOne({ _id: dataActuadores[0]._id }, update).then(() => { });
            });
            //Añadir a data el campo manual : false
            data.manual = false;

            io.sockets.emit('actualizarActuadores', data);
        });

        client.on('almacenarEvento', (data) => {
            console.log('ACTUALIZANDO EVENTOS POR AGENTE');

            let promises = [];

            promises.push(collection2.insertOne(data, { safe: true }));

            // Recojo los 10 eventos más recientes de la base de datos
            Promise.all(promises).then(() => {
                collection2.find({ evento: { $exists: true } }).sort({ $natural: -1 }).limit(10).toArray().then((dataEventos) => {
                    io.sockets.emit('actualizarEventos', dataEventos);
                }).catch((err) => {
                    console.log('Error al obtener los eventos más recientes de la base de datos: ' + err);
                });
            }).catch((err) => {
                console.log('Error al insertar el evento en la base de datos: ' + err);
            });
        });

        client.on('insertarDatosSinAgente', (data) => {
            console.log('ACTIVACIÓN MANUAL DE ACTIVADOR ' + JSON.stringify(data));
        
            collection.find().sort({ $natural: -1 }).limit(1).toArray().then((result) => {
                return result[0];
            }).then((result) => {
                collection.insertOne(data, { safe: true });
                console.log('Datos insertados en la base de datos con éxito. Datos: ' + JSON.stringify(data));
        
                if (result.estadoAC !== data.estadoAC) {
                    return collection2.insertOne({ evento: 'Aire acondicionado o calefacción accionado manualmente', fecha: new Date() }, { safe: true });
                }
                else if (result.estadoPersiana !== data.estadoPersiana) {
                    return collection2.insertOne({ evento: 'Persiana accionada manualmente', fecha: new Date() }, { safe: true });
                }
                else if (result.estadoToldo !== data.estadoToldo) {
                    return collection2.insertOne({ evento: 'Toldo accionado manualmente', fecha: new Date() }, { safe: true });
                }
            }).then(() => {
                return collection2.find({ evento: { $exists: true } }).sort({ $natural: -1 }).limit(10).toArray();
            }).then((dataEventos) => {
                io.sockets.emit('actualizarEventos', dataEventos);
                io.sockets.emit('actualizarClienteEntrante', data);
            });
        });

    });

}).catch((err) => {
    console.log('Error al conectar con la base de datos: ' + err);
});

console.log('Servicio de base de datos iniciado en el puerto 27017');

