import { Request, response, Response } from 'express'
import { Service } from '../services/service'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { sKey } from '../config'
import cloudinary from '../cloudinary'
import fs from 'fs/promises';

class Controller {

    private service: Service

    constructor() {
        this.service = new Service()
    }

    async crearUsuario(req: Request, res: Response): Promise<any> {
        try {
            const creado = await this.service.crearUsuario(req.body)

            return res.status(201).json({ message: 'Usuario creado' })
        } catch (error: any) {
            return res.status(400).json({ error: error.message })
        }
    }

    async loginUsuario(req: Request, res: Response) {
        try {
            const usuario = {
                username: req.body.username,
                password: req.body.password
            }
            const fecha = req.body.fecha
            const hora = req.body.hora

            const login = await this.service.loginUsuario(usuario, fecha, hora)

            const user = req.body.username
            const token = jwt.sign({ user }, sKey, { expiresIn: '2h' })

            res.cookie('token_login', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 1000 * 60 * 60 * 2
            })

            return res.status(200).json('Login correcto')
        } catch (error: any) {
            console.log(error)
            return res.status(400).json({ error: error.message })
        }
    }

    async getLogins(req: Request, res: Response) {
        try {
            const datos = await this.service.getLogins()

            if (datos == null) return res.status(400).json('Error en la petición de logins')

            return res.status(200).json(datos)
        } catch (error) {
            return res.status(400).json('Error al actualizar logins')
        }
    }

    async getUsuario(req: Request, res: Response) {
        try {
            const { username } = req.params

            if (username) {
                const datos = await this.service.getUsuario(username)
                if (!datos) {
                    return res.status(400).json({ error: `El usuario con nombre ${username} no existe` })
                }
                return res.status(200).json(datos)
            }
        } catch (error) {
            return res.status(400).json({ error: 'No se pudo obtener el usuario' })
        }
    }

    async getUsuarioNopass(req: Request, res: Response) {
        try {
            const { username } = req.params

            if (username) {
                const datos = await this.service.getUsuarioNopass(username)
                if (!datos) {
                    return res.status(400).json({ error: `El usuario con nombre ${username} no existe` })
                }
                return res.status(200).json(datos)
            }
        } catch (error) {
            return res.status(400).json({ error: 'No se pudo obtener el usuario' })
        }
    }

    async perfilUsuario(req: Request, res: Response) {
        const token = req.cookies.token_login

        if (!token) {
            return res.status(401).json('No estas logeado')
        }

        try {
            const datosToken = jwt.verify(token, sKey) as JwtPayload
            const username = datosToken.user
            const user = await this.service.getUsuarioNopass(username)

            res.status(200).json(user)

            return user

        } catch (error) {
            console.log(error)
            return res.status(401).json('No autorizado, inicia sesión')
        }
    }

    async logoutUsuario(req: Request, res: Response) {
        res.clearCookie('token_login', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 2
        })
        return res.status(200).json({ message: 'Sesión cerrada' });
    }

    async cambiarPassword(req: Request, res: Response) {
        try {
            const response = await this.service.cambiarPassword(req.body)

            return res.status(200).json('Contraseña actualizada')

        } catch (error: any) {
            return res.status(400).json({ error: error.message })
        }
    }

    async getProfesionales(req: Request, res: Response) {
        try {
            const response = await this.service.getProfesionales()

            if (response === null) return res.status(404).json({ error: 'No se pudieron obtener profesionales' })

            res.status(200).json(response)
        } catch (error) {
            return res.status(400).json('Error en petición de profesionales')
        }
    }

    async perfilImagen(req: Request, res: Response) {
        try {
            const ruta = req.file?.path || ''
            const token = req.cookies.token_login
            const datosToken = jwt.verify(token, sKey) as JwtPayload
            const username = datosToken.user
            const adminUser = req.body.adminUser
            const usuarioActualizar = adminUser || username

            if (ruta == '') throw new Error('Ruta vacía')

            const result = await cloudinary.uploader.upload(ruta, { folder: 'perfiles' });
            await fs.unlink(ruta);

            if (!usuarioActualizar || !result.secure_url) return res.status(400).json({ error: 'No se pudo actualizar' })

            const datos = await this.service.actualizarImagenUsuario(usuarioActualizar, result.secure_url)
            res.status(201).json(datos)
            return datos

        } catch (error: any) {
            return res.status(400).json({ error: error.message })
        }
    }

    async cambiarDescripcion(req: Request, res: Response) {
        try {
            const username = req.body.username
            const adminUsername = req.body.adminUsername
            const descripcion = req.body.descripcion

            if (username && descripcion) {
                const response = await this.service.cambiarDescripcion(username, descripcion)

                if (response === null) return res.status(400).json({ error: 'No se pudo actualizar' })
                return res.status(200).json('Descripción actualizada')
            }

            else if (adminUsername && descripcion) {
                const response = await this.service.cambiarDescripcion(adminUsername, descripcion)

                if (response === null) return res.status(400).json({ error: 'No se pudo actualizar' })
                return res.status(200).json('Descripción actualizada')
            }

        } catch (error) {
            return res.status(400).json('Error al cambiar la descripción')
        }
    }

    async actualizarUsuario(req: Request, res: Response) {
        try {
            const adminUser = req.body.adminUser
            const username = req.body.putUsername
            const email = req.body.putEmail
            const descripcion = req.body.putDescripcion
            const priorizar = req.body.priorizar
            const imagen = req.body.rutaImagen

            if (!adminUser) return res.status(400).json({ error: 'El usuario no existe' })

            if (!username && !email && !descripcion && !imagen && !priorizar) {
                return res.status(400).json({
                    error: 'No hay datos para actualizar'
                });
            }

            const response = await this.service.actualizarUsuario(adminUser, username, email, descripcion, priorizar)

            if (response === null) return res.status(400).json({ error: 'No se ha actualizado' })

            return res.status(200).json('Descripción actualizada')
        } catch (error: any) {
            return res.status(400).json({ error: error.message })
        }
    }

    async borrarUsuario(req: Request, res: Response) {
        try {
            const borrarUsername = req.body.adminUsername
            const user = req.body.username

            if (user == 'admin') {
                const response = await this.service.borrarUsuario(borrarUsername)

                if (response === null) return res.status(404).json('Usuario no encontrado')

                return res.status(200).json('Usuario Borrado')
            }
            else {
                const response = await this.service.borrarUsuario(user)

                if (response === null) return res.status(404).json('Usuario no encontrado')

                await this.logoutUsuario(req, res)
            }
        } catch (error) {
            return res.status(400).json('Error al borrar el usuario')
        }
    }

    async crearAsociado(req: Request, res: Response) {
        try {
            const body = req.body
            const response = await this.service.crearAsociado(body)

            if (response === null) return res.status(400).json('Error en petición al crear usuario')

            return res.status(200).json('Usuario creado')
        } catch (error) {
            return res.status(400).json('Error al crear asociado')
        }
    }

    async imagenAsociado(req: Request, res: Response) {
        try {
            const ruta = req.file?.path || ''

            if(!ruta || ruta == '') res.status(400).json('Imagen no encontrada')

            const result = await cloudinary.uploader.upload(ruta, { folder: 'perfiles' });
            await fs.unlink(ruta);

            return res.status(200).json(result.secure_url)
        } catch (error) {
            return res.status(400).json('Error al añadir imagen en asociado')
        }
    }

    async getAsociado(req: Request, res: Response) {
        try {
            const asociado = req.params.asociado

            if (asociado) {
                const datos = await this.service.getAsociado(asociado)
                if (!datos) {
                    return res.status(400).json({ error: `El asociado con nombre ${asociado} no existe` })
                }
                return res.status(200).json(datos)
            }
        } catch (error) {
            return res.status(400).json('Error al obtener el asociado')
        }
    }

    async getAsociados(req: Request, res: Response) {
        try {
            const response = await this.service.getAsociados()

            if (response === null) return res.status(400).json('Error en petición al obtener asociados')

            return res.status(200).json(response)
        } catch (error) {
            return res.status(400).json('Error al obtener asociados')
        }
    }

    async actualizarAsociado(req: Request, res: Response) {
        try {
            const adminAsociado = req.body.adminAsociado
            const asociado = req.body.putNombreAsociado
            const enlace = req.body.putEnlaceAsociado
            const imagen = req.body.crearImagenAsociado

            if (!adminAsociado) return res.status(400).json({ error: 'El asociado no existe' })

            if (!asociado && !enlace && !imagen) {
                return res.status(400).json({
                    error: 'No hay datos para actualizar'
                });
            }

            const response = await this.service.actualizarAsociado(adminAsociado, asociado, enlace, imagen)

            if (response === null) return res.status(400).json({ error: 'No se ha actualizado' })

            return res.status(200).json('Descripción actualizada')

        } catch (error: any) {
            return res.status(400).json({ error: error.message })
        }
    }

    async borrarAsociado(req: Request, res: Response) {
        try {
            const asociado = req.body.adminAsociado

            if (!asociado) return res.status(400).json('No existe el asociado')

            const response = await this.service.borrarAsociado(asociado)

            if (!response) return res.status(400).json('No se ha podido borrar el asociado')

            return res.status(200).json('Asociado eliminado')

        } catch (error) {
            return res.status(400).json('Error al eliminar el asociado')
        }
    }

    async getTodasImagenes(req: Request, res: Response) {
        try {
            const response = await this.service.getTodasImagenes()

            if (!response) return res.status(400).json('No se han recibido imágenes')

            return res.status(200).json(response)
        } catch (error) {
            return res.status(400).json('Error al recibir imágenes')
        }
    }

    async getImagenes(req: Request, res: Response) {
        try {
            const artista = req.params.artista

            if (!artista) return res.status(400).json('No hay un usuario')

            const response = await this.service.getImagenes(artista)

            if (response === null) return res.status(400).json('Error en petición al obtener imágenes')

            return res.status(200).json(response)
        } catch (error) {
            return res.status(400).json('Error al obtener imágenes')
        }
    }

    async galeria(req: Request, res: Response) {
        try {
            const ruta = req.file?.path
            const username = req.body.username
            if (!username || !ruta) return res.status(400).json({ error: 'No se pudo actualizar' })

            const result = await cloudinary.uploader.upload(ruta, { folder: 'perfiles' });
            await fs.unlink(ruta);

            const datos = await this.service.galeria(username, result.secure_url)

            return res.status(201).json(datos)
        } catch (error: any) {
            return res.status(400).json({ error: 'Error al subir la imagen' })
        }
    }

    async borrarImagenGaleria(req: Request, res: Response) {
        try {
            const ruta = req.body.ruta
            const username = req.body.username
            const response = await this.service.borrarImagenGaleria(username, ruta)

            if (!response) return res.status(400).json('No se ha podido borrar la imagen')

            return res.status(201).json(response)
        } catch (error) {
            console.log(error)
            return res.status(400).json('Error al borrar la imagen')
        }
    }

    async crearConsulta(req: Request, res: Response) {
        try {
            const body = req.body
            const response = await this.service.crearConsulta(body)

            return res.status(201).json('Consulta enviada')
        } catch (error) {
            console.log(error)
            return res.status(400).json('Error al crear consulta')
        }
    }

    async getConsultas(req: Request, res: Response) {
        try {
            const artista = req.params.artista

            if (!artista || artista == '') return res.status(400).json('Artista incorrecto')

            const response = await this.service.getConsultas(artista)

            if (response == null) return res.status(400).json('No se obtuvieron consultas')

            return res.status(200).json(response)
        } catch (error) {
            console.log(error)
            return res.status(400).json('Error al obtener consultas')
        }
    }

    async crearReporte(req: Request, res: Response) {
        try {
            const body = req.body

            const response = await this.service.crearReporte(body)

            if (response == null) return res.status(400).json('No se creó el reporte')

            return res.status(201).json(response)
        } catch (error) {
            console.log(error)
            return res.status(400).json('Error al crear reporte')
        }
    }

    async getReportes(req: Request, res: Response) {
        try {
            const response = await this.service.getReportes()

            if (response == null) return res.status(400).json('No se obtuvieron reportes')

            return res.status(201).json(response)
        } catch (error) {
            console.log(error)
            return res.status(400).json('Error al pedir reportes')
        }
    }

    async borrarReporte(req: Request, res: Response) {
        try {
            const id = req.params.id

            if (id == '' || !id) return res.status(400).json('Id inválido')

            const response = await this.service.borrarReporte(id)

            if (response == null) return res.status(400).json('No se borro el reporte')

            return res.status(200).json(response)
        } catch (error) {
            console.log(error)
            return res.status(400).json('Error al borrar reporte')
        }
    }

    async crearLike(req: Request, res: Response) {
        try {
            const { username, usernameLikeado } = req.body

            if (!username || !usernameLikeado) return res.status(400).json('No se dió like')

            const response = await this.service.crearLike(username, usernameLikeado)

            if (response == null) return res.status(400).json('No se dió like')

            return res.status(200).json(response)

        } catch (error) {
            console.log(error)
            return res.status(400).json('Error al dar like')
        }
    }

    async getLikes(req: Request, res: Response) {
        try {
            const username = req.params.username
            const usernameLikeado = req.query.usernameLikeado as string

            if (!username || !usernameLikeado) return res.status(400).json('No hay usuario')

            const response = await this.service.getLikes(username, usernameLikeado)

            if (response == null) return res.status(400).json('No hay likes')

            return res.status(200).json(response)
        } catch (error) {
            console.log(error)
            return res.status(400).json('Error al obtener like')
        }
    }

    async quitarLike(req: Request, res: Response) {
        try {
            const username = req.params.username
            const usernameLikeado = req.query.usernameLikeado as string

            if (!username || !usernameLikeado) return res.status(400).json('No hay usuario')

            const response = await this.service.quitarLike(username, usernameLikeado)

            if (response == null) return res.status(400).json('No hay likes')

            return res.status(200).json(response)
        } catch (error) {
            console.log(error)
            return res.status(400).json('Error al quitar like')
        }
    }

    async getMasRecomendados(req: Request, res: Response) {
        try {
            const response = await this.service.getMasRecomendados()

            if (response == null) return res.status(400).json('No hay artistas likeados')

            return res.status(200).json(response)
        } catch (error) {
            console.log(error)
            return res.status(400).json('Error al quitar like')
        }
    }

    async getProfesional(req: Request, res: Response) {
        try {
            const username = req.params.username

            if (!username) return res.status(400).json('No existe')

            const response = await this.service.getProfesional(username)

            return res.status(200).json(response)
        } catch (error: any) {
            console.log(error)
            return res.status(400).json({ error: error.message })
        }
    }

    async crearOpinion(req: Request, res: Response) {
        try {
            const username = req.body.username
            const opinion = req.body.opinion

            const response = await this.service.crearOpinion(username, opinion)

            return res.status(201).json(response)
        } catch (error: any) {
            console.log(error)
            return res.status(400).json({ error: error.message })
        }
    }

    async getOpiniones(req: Request, res: Response) {
        try {
            const response = await this.service.getOpiniones()

            if (response == null) return res.status(400).json('Error al obtener opinones')

            return res.status(200).json(response)
        } catch (error) {
            console.log(error)
            return res.status(400).json('Error al obtener opinones')
        }
    }

    async borrarOpinion(req: Request, res: Response) {
        try {
            const id = req.params.id

            if (id == '' || !id) return res.status(400).json('Id inválido')

            const response = await this.service.borrarOpinion(id)

            if (response == null) return res.status(400).json('No se borro la opinión')

            return res.status(200).json(response)
        } catch (error) {
            console.log(error)
            return res.status(400).json('Error al borrar opinión')
        }
    }
}

export { Controller }