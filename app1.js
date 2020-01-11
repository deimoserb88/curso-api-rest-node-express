const debug = require('debug')('app:inicio');
//const dbDebug = require('debug')('app:db');
const express = require('express');
const Joi = require('@hapi/joi');//Para validación de datos de entrada
const logger = require('./logger');//este es un módulo local
const config = require('config');//midleware de terceros
const morgan = require('morgan');//midleware de terceros


const app = express();

app.use(express.json());//Con esto se permite que las peticiones que bienen del body en forato Json se puedan reconocer

//**Sección 7 */

app.use(express.urlencoded({extended:true}));   //Con este middleware se permite que las peticiones (formularios) 
                                                //que vengan en fromatos de formulario se puedan reconocer

app.use(express.static('public'));//Con este middleware se puede acceder a recursos estáticos del servidor

//**Para la sección 7, así se inbocan los middleware */

app.use(function(req,res,next){
    //.....
    next(); //si no usamos next, no continúa la ejecución, estas acciones se realizan antes
            //de que se ejecueten las funciones normales.
});

app.use(logger);

//Configuración de entornos
console.log("Aplicación: " + config.get("nombre"));
console.log("SB server: " + config.get("configDB.host"));


if(app.get('env') === 'development'){
    app.use(morgan('tiny'));
    //console.log('Morgan habilitado')
    debug('Morgan habilitado');
}

//Tareas co la BD
debug('Conectando con la Base de Datos');


const port = process.env.PORT || 3001;

app.listen(port,() => console.log(`Servidor en línea, escuchando el el puerto ${port}...`));

//Datos (BD)
const users = [
    {id:1,nom:'Viky'},
    {id:2,nom:'Alma'},
    {id:3,nom:'Yomero'}
];

//POST -> Create
app.post('/api/users',(req,res) => {

    const {error,value} = validateUser(req.body.nom);

    if(!error){
        const u = {
            id  : users.length + 1,
            nom : value.nom,
        }; 
        users.push(u);
        res.send(u);
    }else{
        res.status(400).send(error.message);
    }
    
    // if(!req.body.nom || req.body.nom.length <= 2 ){
    //     res.status(400).send('Es necesario introducir un nombre válido con al menos 3 caracteres de longitud');
    //     return;
    // }


});

//GET -> Read
app.get('/', (req,res) => {
    res.send('Este es el home');
});
app.get('/nadaaqui', (req,res) => {
    res.send('Aqui no hay nada <b>we</b>');
});

app.get('/api/users', (req,res) => {
    res.send(users);
});

app.get('/api/users/:id', (req,res) => {
    //res.send(req.params.id);
    var id = req.params.id;

    let user = getUser(req.params.id,res);//users.find(u => u.id === parseInt(id));
    if(!user){
        res.status(404).send('Ese bato no está en la BD');
        return;
    }
    res.send(user.nom);
});

app.get('/inex', (req,res) => {
    res.status(404).send('404 | esa mierda que buscas no está en este servidor');
});

//Update
app.put('/api/users/:id', (req,res) => {
    //1o localizar el usuario que se va a modificar
    let user = getUser(req.params.id);
    if(!user){
        res.status(404).send('Ese bato no está en la BD');
        return;
    }
    const {error,value} = validateUser(req.body.nom);
    if(error){
        res.status(400).send(error.message);
        return;
    }  

    user.nom = value.nom;
    res.send(user);

});     

//Delete
app.delete('/api/users/:id', (req,res) => {
    //1o localizar el usuario que se va a eliminar
    let user = getUser(req.params.id);
    if(!user){
        res.status(404).send('Ese bato no está en la BD');
        return;
    }    
    const idx = users.indexOf(user);
    users.splice(idx,1);
    res.send(users);
});   





//**Funciones auxiliares */
function getUser(id){
    return users.find(u => u.id === parseInt(id));
}

function validateUser(n){
    const schema = Joi.object({
        nom: Joi.string()
            .min(3)
            .required()
    });
    return schema.validate({nom : n });    
}

