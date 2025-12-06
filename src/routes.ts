import express from 'express'
import { Controller } from './controller/controller'
import multer from 'multer'

const router = express.Router()
const controller = new Controller()

const subirImagen = multer({ dest: 'imagenes/' });

//USUARIOS
router.get('/perfil', (req, res) => controller.perfilUsuario(req, res))

router.get('/getUsuario/:username', (req, res) => controller.getUsuario(req, res))

router.get('/getUsuarioNopass/:username', (req, res) => controller.getUsuarioNopass(req, res))

router.get('/profesionales', (req, res) => controller.getProfesionales(req, res))

router.get('/profesional/:username', (req, res) => controller.getProfesional(req, res))

router.post('/perfil/imagen', subirImagen.single('imagenPerfil'), (req, res) => controller.perfilImagen(req, res))

router.put('/perfil/cambiarPassword', (req, res) => controller.cambiarPassword(req, res))

router.put('/perfil/admin/actualizarUsuario', (req, res) => controller.actualizarUsuario(req, res))

router.put('/perfil/descripcion', (req, res) => controller.cambiarDescripcion(req, res))

router.delete('/perfil', (req, res) => controller.borrarUsuario(req, res))

//REGISTRO
router.post('/registro', (req, res) => {
  console.log('Body recibido:', req.body);
  controller.crearUsuario(req, res);
});
//LOGINS
router.post('/login', (req, res) => controller.loginUsuario(req, res))

router.get('/login', (req, res) => controller.getLogins(req, res))

router.post('/logout', (req, res) => controller.logoutUsuario(req, res))

//ASOCIADOS
router.post('/asociados', (req, res) => controller.crearAsociado(req, res))

router.get('/asociados', (req, res) => controller.getAsociados(req, res))

router.get('/asociados/:asociado', (req, res) => controller.getAsociado(req, res))

router.post('/asociados/imagen', subirImagen.single('crearImagenAsociado'), (req, res) => controller.imagenAsociado(req, res))

router.put('/asociados', (req, res) => controller.actualizarAsociado(req, res))

router.delete('/asociados', (req, res) => controller.borrarAsociado(req, res))

//GALERIA
router.get('/galeria', (req, res) => controller.getTodasImagenes(req, res))

router.get('/galeria/:artista', (req, res) => controller.getImagenes(req, res))

router.post('/galeria', subirImagen.single('imagenUsuario'), (req, res) => controller.galeria(req, res))

router.delete('/galeria', (req, res) => controller.borrarImagenGaleria(req, res))

//CONSULTA
router.get('/consulta/:artista', (req, res) => controller.getConsultas(req, res))

router.post('/consulta', (req, res) => controller.crearConsulta(req, res))

//REPORTES
router.get('/reporte', (req, res) => controller.getReportes(req, res)) 

router.post('/reporte', (req, res) => controller.crearReporte(req, res)) 

router.delete('/reporte/:id', (req, res) => controller.borrarReporte(req, res)) 

//LIKES
router.get('/likes', (req, res) => controller.getMasRecomendados(req, res))

router.get('/likes/:username', (req, res) => controller.getLikes(req, res))

router.post('/likes', (req, res) => controller.crearLike(req, res))

router.delete('/likes/:username', (req, res) => controller.quitarLike(req, res))

//OPINIONES
router.get('/opiniones' , (req,res) => controller.getOpiniones(req,res))

router.post('/opiniones' , (req, res) => controller.crearOpinion(req, res))

router.delete('/opiniones/:id' , (req, res) => controller.borrarOpinion(req, res))


export default router