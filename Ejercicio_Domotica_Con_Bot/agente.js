import { io } from 'socket.io-client';
import { config } from 'dotenv';
import { Telegraf } from 'telegraf';
config();

const url = 'http://localhost:8080?clientType=agent';
const socket = io(url);

// Variables globales para almacenar la información de los sensores y actuadores

var recienteInfoSensores;
var recienteInfoActuadores;
var eventoReciente;
var evento;

//Código del Bot en el agente ---------------------------------------------------------------------------------------------

const bot = new Telegraf(process.env.BOT_KEY); // Creamos el bot con el token que nos proporciona BotFather

bot.start((ctx) =>
    mandarMenuInicial(ctx)
); // Comando de inicio

function mandarMenuInicial(ctx) {
    const bienvenida = "Bienvenido al bot de la casa inteligente. ¿Qué deseas hacer?";

    bot.telegram.sendMessage(ctx.chat.id, bienvenida, {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Ver evento reciente', callback_data: 'verEvento' },
                ],
                [
                    { text: 'Ver umbrales actuales', callback_data: 'verUmbrales' },
                ],
                [
                    { text: 'Ver estado sensores y actuadores', callback_data: 'verSensoresActuadores' },
                ]
            ]
        }

    });
}

bot.on('callback_query', async (ctx) => {
    try {
        // Intenta responder a la consulta de devolución de llamada
        await ctx.answerCbQuery();

        // Luego maneja los datos de la devolución de llamada
        const callbackData = ctx.callbackQuery.data;

        if (callbackData === 'verEvento') {
            ctx.answerCbQuery();

            if (eventoReciente === undefined) {
                ctx.reply("No hay eventos recientes");
            } else {
                ctx.reply("💬 Evento reciente: \n -" + eventoReciente.evento + " / " + eventoReciente.fecha);
            }

            mandarMenuInicial(ctx);
        }
        if (callbackData === 'verUmbrales') {
            ctx.answerCbQuery();

            ctx.reply("🌡️ Umbrales actuales 🌡️: \n -🌡️Temperatura máxima: " + UMBRAL_TEMPERATURA_CALOR + "ºC \n -🌡️Temperatura apagado: " + UMBRAL_TEMPERATURA_FRIO + "ºC \n -🔦Luminosidad máxima: " + UMBRAL_LUMINOSIDAD + " lux \n -⛈️Viento máximo: " + UMBRAL_VIENTO + " km/h");

            mandarMenuInicial(ctx);
        }
        if (callbackData === 'verSensoresActuadores') {
            ctx.answerCbQuery();

            if (recienteInfoSensores === undefined || recienteInfoActuadores === undefined) {
                ctx.reply("No hay información reciente de sensores y actuadores");
            } else {
                ctx.reply("📊 Información reciente de sensores y actuadores 📊: \n -🌡️Temperatura: " + recienteInfoSensores.temperatura + "ºC \n -🔦Luminosidad: " + recienteInfoSensores.luminosidad + " lux \n -⛈️Viento: " + recienteInfoSensores.viento + " km/h \n -🔌Estado aire acondicionado: " + recienteInfoActuadores.estadoAC + " \n -🪟Estado persiana: " + recienteInfoActuadores.estadoPersiana + " \n -⛺Estado toldo: " + recienteInfoActuadores.estadoToldo);
            }

            mandarMenuInicial(ctx);
        }
    } catch (error) {
        console.error('Error al responder a la consulta de devolución de llamada:', error);
    }
});

bot.action('verEvento', (ctx) => {

    ctx.answerCbQuery();

    if (eventoReciente === undefined) {
        ctx.reply("No hay eventos recientes");
    } else {
        ctx.reply("💬 Evento reciente: \n -" + eventoReciente.evento + " / " + eventoReciente.fecha);
    }

    mandarMenuInicial(ctx);
});

bot.action('verUmbrales', (ctx) => {

    ctx.answerCbQuery();

    ctx.reply("🌡️ Umbrales actuales 🌡️: \n -🌡️Temperatura máxima: " + UMBRAL_TEMPERATURA_CALOR + "ºC \n -🌡️Temperatura apagado: " + UMBRAL_TEMPERATURA_FRIO + "ºC \n -🔦Luminosidad máxima: " + UMBRAL_LUMINOSIDAD + " lux \n -⛈️Viento máximo: " + UMBRAL_VIENTO + " km/h");

    mandarMenuInicial(ctx);
});

bot.action('verSensoresActuadores', (ctx) => {

    ctx.answerCbQuery();

    if (recienteInfoSensores === undefined || recienteInfoActuadores === undefined) {
        ctx.reply("No hay información reciente de sensores y actuadores");
    } else {
        ctx.reply("📊 Información reciente de sensores y actuadores 📊: \n -🌡️Temperatura: " + recienteInfoSensores.temperatura + "ºC \n -🔦Luminosidad: " + recienteInfoSensores.luminosidad + " lux \n -⛈️Viento: " + recienteInfoSensores.viento + " km/h \n -🔌Estado aire acondicionado: " + recienteInfoActuadores.estadoAC + " \n -🪟Estado persiana: " + recienteInfoActuadores.estadoPersiana + " \n -⛺Estado toldo: " + recienteInfoActuadores.estadoToldo);
    }

    mandarMenuInicial(ctx);
});

bot.launch(); // Iniciamos el bot

//--------------------------------------------------------------------------------------------------------------------------------

var UMBRAL_TEMPERATURA_CALOR = 30;
var UMBRAL_TEMPERATURA_FRIO = 20;

var UMBRAL_LUMINOSIDAD = 10000; //interiores

var UMBRAL_VIENTO = 20;

function actualizarActuadores(data) {

    console.log("ANALIZANDO DATOS DEL CLIENTE : DATOS --> " + JSON.stringify(data));

    //Guardar la info reciente para el bot
    recienteInfoSensores = data;

    const temperatura = data.temperatura;
    const luminosidad = data.luminosidad;
    const viento = data.viento;

    const estadoAC = data.estadoAC;
    const estadoPersiana = data.estadoPersiana;
    const estadoToldo = data.estadoToldo;

    console.log('UMBRALES -> UMBRAL_TEMPERATURA_CALOR: ' + UMBRAL_TEMPERATURA_CALOR + ' UMBRAL_TEMPERATURA_FRIO: ' + UMBRAL_TEMPERATURA_FRIO + ' UMBRAL_LUMINOSIDAD: ' + UMBRAL_LUMINOSIDAD + ' UMBRAL_VIENTO: ' + UMBRAL_VIENTO);

    var datosAMandar = {
        estadoAC: estadoAC,
        estadoPersiana: estadoPersiana,
        estadoToldo: estadoToldo
    };

    if (Number(temperatura) > Number(UMBRAL_TEMPERATURA_CALOR)) {

        if (estadoAC === 'Apagado') {
            console.log('Temperatura extrema, se enciende el aire acondicionado o la calefacción');
            datosAMandar.estadoAC = 'Encendido';
            evento = { evento: 'Aire acondicionado o calefacción encendidos por temperatura extrema', fecha: new Date() };
            eventoReciente = evento;
            socket.emit('almacenarEvento', evento);
        }

    } else if (Number(temperatura) < Number(UMBRAL_TEMPERATURA_FRIO)) {

        if (estadoAC === 'Encendido') {
            console.log('Temperatura normal, se apaga el aire acondicionado o la calefacción');
            datosAMandar.estadoAC = 'Apagado';
            evento = { evento: 'Aire acondicionado o calefacción apagados por temperatura normal', fecha: new Date() };
            eventoReciente = evento;
            socket.emit('almacenarEvento', evento);
        }
    }


    if (Number(luminosidad) > Number(UMBRAL_LUMINOSIDAD)) {

        if (estadoPersiana === 'Apagado') {
            console.log('Hay poca luz, se abren las persianas');
            datosAMandar.estadoPersiana = 'Encendido';
            evento = { evento: 'Persianas cerradas por exceso de luz', fecha: new Date() };
            eventoReciente = evento;
            socket.emit('almacenarEvento', evento);
        }

    } else {

        if (estadoPersiana === 'Encendido') {
            console.log('Hay suficiente luz, se cierran las persianas');
            datosAMandar.estadoPersiana = 'Apagado';
            evento = { evento: 'Persianas abiertas por luz normal', fecha: new Date() };
            eventoReciente = evento;
            socket.emit('almacenarEvento', evento);
        }
    }

    if (Number(viento) < Number(UMBRAL_VIENTO)) {

        if (estadoToldo === 'Apagado') {
            console.log('No hace viento, se extiende el toldo');
            datosAMandar.estadoToldo = 'Encendido';
            evento = { evento: 'Toldo extendido, viento favorable', fecha: new Date() };
            eventoReciente = evento;
            socket.emit('almacenarEvento', evento);
        }

    } else {
        if (estadoToldo === 'Encendido') {
            console.log('Hace viento, se recoge el toldo');
            datosAMandar.estadoToldo = 'Apagado';
            evento = { evento: 'Toldo recogido, viento desfavorable', fecha: new Date() };
            eventoReciente = evento;
            socket.emit('almacenarEvento', evento);
        }
    }

    //Guardar la info reciente para el bot
    recienteInfoActuadores = datosAMandar;

    return datosAMandar;
}

socket.on('actualizarUmbrales', (data) => {
    UMBRAL_TEMPERATURA_CALOR = data.temperaturaMax;
    UMBRAL_TEMPERATURA_FRIO = data.temperaturaMin;
    UMBRAL_LUMINOSIDAD = data.luzMax;
    UMBRAL_VIENTO = data.vientoMax;
    console.log('Umbrales actualizados: UMBRAL_TEMPERATURA_CALOR: ' + UMBRAL_TEMPERATURA_CALOR + ' UMBRAL_TEMPERATURA_FRIO: ' + UMBRAL_TEMPERATURA_FRIO + ' UMBRAL_LUMINOSIDAD: ' + UMBRAL_LUMINOSIDAD + ' UMBRAL_VIENTO: ' + UMBRAL_VIENTO);
});


socket.on('actualizarSensores', (data) => {
    var datosAMandar = actualizarActuadores(data);
    socket.emit('actualizarActuadores', datosAMandar);
});