# Proyecto: Desarrollo de Sistemas Distribuidos con Node.js

**Grado en Ingeniería Informática**  
**Desarrollo de Sistemas Distribuidos**

**P4: Node.js. Desarrollo de Sistemas Distribuidos**

**Autor:** Juan Miguel Acosta Ortega  
**Correo:** acostaojuanmi@correo.ugr.es  
**Fecha:** 27 de mayo de 2024

## Índice

1. [Primera parte de la práctica: Revisión de ejemplos](#primera-parte-de-la-práctica-revisión-de-ejemplos)
    - [Hola Mundo Cliente-Servidor](#hola-mundo-cliente-servidor)
    - [Calculadora distribuida](#calculadora-distribuida)
    - [Calculadora distribuida con interfaz web](#calculadora-distribuida-con-interfaz-web)
    - [Aplicaciones en tiempo real con Socket.io](#aplicaciones-en-tiempo-real-con-socketio)
    - [Uso de MongoDB desde Node.js](#uso-de-mongodb-desde-nodejs)
2. [Segunda parte de la práctica: Sistema domótico en Node.js](#segunda-parte-de-la-práctica-sistema-domótico-en-nodejs)
    - [El servidor](#el-servidor)
    - [Cliente navegador](#cliente-navegador)
    - [Agente](#agente)
    - [Mandar notificaciones a Telegram](#mandar-notificaciones-a-telegram)

## Objetivos

La primera parte consiste en seguir los pasos para implementar y probar los ejemplos del guión. Se ha de demostrar que funcionan y explicar qué ocurre en ellos.

La segunda parte consiste en implementar un sistema domótico con esta tecnología siguiendo las restricciones y requisitos descritos a continuación. Se ha de suponer un sistema domótico básico compuesto de dos sensores (luminosidad y temperatura), dos actuadores (motor persiana y sistema de Aire/Acondicionado), un servidor que sirve páginas para mostrar el estado y actuar sobre los elementos de la vivienda. Además dicho servidor incluye un agente capaz de notificar alarmas y tomar decisiones básicas.

## Primera parte de la práctica: Revisión de ejemplos

### Hola Mundo Cliente-Servidor

En este primer ejemplo creamos un servidor HTTP básico en Node.js usando el módulo `http`. Utilizamos el método `createServer()` al que se le pasa una función "callback" que se ejecuta cada vez que recibe una solicitud HTTP. El servidor escucha en el puerto 8080 y responde con "Hola Mundo".

### Calculadora distribuida

Este ejemplo amplía el anterior creando un servidor que procesa una URL para realizar cálculos. La URL contiene los parámetros necesarios para el cálculo, que se realiza en el servidor y se envía de vuelta al cliente.

### Calculadora distribuida con interfaz web

En este ejemplo, el servidor también envía un archivo HTML al cliente, que sirve como interfaz para la calculadora. El cliente puede introducir valores en un formulario, y el servidor procesa estos valores para realizar el cálculo y devolver el resultado.

### Aplicaciones en tiempo real con Socket.io

Este ejemplo utiliza Socket.io para implementar un servicio que envía notificaciones a todos los clientes conectados cada vez que un cliente se conecta o desconecta. También se pueden enviar mensajes personalizados a los clientes.

### Uso de MongoDB desde Node.js

El último ejemplo muestra cómo conectar Node.js con una base de datos MongoDB para insertar y consultar datos. Se establece una conexión a la base de datos, y se crean eventos para manejar la inserción y consulta de datos.

## Segunda parte de la práctica: Sistema domótico en Node.js

En esta parte se implementa un sistema domótico compuesto de tres sensores (temperatura, luminosidad y viento) y tres actuadores (A/C, persianas y toldo). Un servidor central gestiona la interfaz gráfica y la comunicación entre las distintas entidades del sistema, incluyendo un agente que toma decisiones basadas en los datos de los sensores.

### El servidor

El servidor se conecta a una base de datos MongoDB y gestiona tres colecciones: Datos, Eventos y Umbrales. Se encarga de enviar y recibir información de los clientes y del agente, y de actualizar la base de datos con los datos de los sensores y los estados de los actuadores.

### Cliente navegador

El cliente navegador permite al usuario interactuar con el sistema domótico a través de una interfaz gráfica. Puede ver los datos de los sensores, controlar los actuadores y establecer umbrales para la activación automática de los actuadores.

### Agente

El agente toma decisiones basadas en los datos de los sensores y los umbrales establecidos. Puede activar o desactivar los actuadores automáticamente y enviar notificaciones al servidor.

### Mandar notificaciones a Telegram

El sistema incluye una funcionalidad adicional para enviar notificaciones a través de Telegram cuando se detectan ciertas condiciones en los sensores.

## Instalación y uso

Para ejecutar el proyecto, sigue estos pasos:

1. Clona el repositorio:
    ```bash
    git clone https://github.com/tu-usuario/tu-repositorio.git
    ```
2. Instala las dependencias:
    ```bash
    cd tu-repositorio
    npm install
    ```
3. Configura el archivo `.env` con las variables necesarias:
    ```env
    DB_URI=mongodb://localhost:27017/nombre-de-tu-bd
    TELEGRAM_API_KEY=tu-telegram-api-key
    ```
4. Inicia el servidor:
    ```bash
    node server.js
    ```

## Licencia

Este proyecto está licenciado bajo la MIT License. Consulta el archivo LICENSE para más detalles.

## Contacto

Para más información, puedes contactar a Juan Miguel Acosta Ortega en [acostaojuanmi@correo.ugr.es](mailto:acostaojuanmi@correo.ugr.es).
