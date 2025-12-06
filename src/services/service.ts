import { Repository } from '../repository/repository'
import { Usuarios } from '../models/usuarios'
import * as EmailValidator from 'email-validator'
import bcrypt from 'bcrypt'
import { Asociados } from '../models/asociados'
import fs from 'fs/promises';

class Service {
    private repository: Repository

    constructor() {
        this.repository = new Repository()
    }

    async crearUsuario(datos: Usuarios) {
        if (datos) {
            try {
                if (typeof datos.username != 'string') throw new Error('El nombre de usuario debe ser un string')
                if (datos.username.length < 5) throw new Error('El nombre de usuario debe tener al menos 5 caracteres')
                if (typeof datos.password != 'string') throw new Error('La contraseña debe ser un string')
                if (datos.password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres')
                if (datos.email) if (EmailValidator.validate(datos.email) == false) throw new Error('Email no válido')
                if (datos.password != datos.rpassword) throw new Error('Las contraseñas no coinciden')
                if (await this.repository.getUsuario(datos.username)) throw new Error('El usuario existe')
                if (datos.email) if (await this.repository.getUsuarioEmail(datos.email)) throw new Error('El email existe')

                const hashedPass = bcrypt.hashSync(datos.password, 10)

                datos.password = hashedPass

                return await this.repository.crearUsuario(datos)
            } catch (error) {
                throw error
            }
        }
    }

    async loginUsuario(datos: Usuarios, fecha: string, hora: string) {
        try {
            await this.repository.loginLogs(datos.username, fecha, hora)

            if (typeof datos.username != 'string') throw new Error('El nombre de usuario debe ser un string')
            if (datos.username.length < 5) throw new Error('El nombre de usuario debe tener al menos 5 caracteres')
            if (typeof datos.password != 'string') throw new Error('La contraseña debe ser un string')
            if (datos.password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres')

            if (await this.repository.getUsuario(datos.username)) {
                const user = await this.repository.getUsuario(datos.username)
                if (user) {
                    const passBBDD = user.password

                    if (!passBBDD) throw new Error('La contraseña no coincide')

                    if (!bcrypt.compareSync(datos.password, passBBDD)) throw new Error('Las contraseñas no coinciden')

                    return true
                }
            } else {
                throw new Error('El usuario no existe')
            }
        } catch (error) {
            throw error
        }
    }

    async getLogins() {
        try {
            const response = await this.repository.getLogins()

            if (!response) return []

            return response
        } catch (error) {
            throw error
        }
    }

    async getUsuario(username: string): Promise<Usuarios | null> {
        try {
            const user = await this.repository.getUsuario(username)
            return user
        } catch (error) {
            return null
        }
    }

    async getUsuarioNopass(username: string): Promise<Usuarios | null> {
        try {
            const user = await this.repository.getUsuarioNopass(username)
            return user
        } catch (error) {
            return null
        }
    }

    async cambiarPassword(datos: any) {
        try {
            const user = await this.repository.getUsuario(datos.username)
            const username = datos.username
            const BBDDpassword = user?.password
            const prevPassword = datos.prevPassword
            const newPassword = datos.newPassword

            if (prevPassword.length < 8) throw new Error('La contraseña tiene menos de 8 caracteres')
            if (newPassword.length < 8) throw new Error('La contraseña tiene menos de 8 caracteres')
            if (BBDDpassword) { if (!bcrypt.compareSync(prevPassword, BBDDpassword)) throw new Error('Las contraseñas no coinciden') }

            const hashedPass = bcrypt.hashSync(newPassword, 10)

            await this.repository.cambiarPassword(username, hashedPass)
        } catch (error) {
            throw error
        }
    }

    async actualizarImagenUsuario(username: string, ruta: string): Promise<any> {
        try {
            const rutaCheck = ruta.replace(/\\/g, "/");

            if (username) {
                const response = await this.repository.actualizarImagenUsuario(username, rutaCheck)
                return response
            }
        } catch (error) {
            return null
        }
    }

    async cambiarDescripcion(username: string, descripcion: string) {
        try {
            const response = this.repository.cambiarDescripcion(username, descripcion)

            return response
        } catch (error) {
            throw error
        }
    }

    async actualizarUsuario(adminUser: string, username?: string, email?: string, descripcion?: string, priorizar?: string) {
        try {
            if (email) {
                if (EmailValidator.validate(email) == false) throw new Error('Email no válido')
            }

            const response = this.repository.actualizarUsuario(adminUser, username, email, descripcion, priorizar)

            return response
        } catch (error) {
            throw error
        }
    }

    async borrarUsuario(username: string) {
        try {
            const response = await this.repository.borrarUsuario(username)

            return response
        } catch (error) {
            throw error
        }
    }

    async crearAsociado(datos: Asociados) {
        try {
            if (!datos) return null
            const response = await this.repository.crearAsociado(datos)

            return response
        } catch (error) {
            throw error
        }
    }

    async getAsociado(asociado: string) {
        try {
            const response = await this.repository.getAsociado(asociado)

            return response
        } catch (error) {
            throw error
        }
    }

    async getAsociados() {
        try {
            const response = await this.repository.getAsociados()

            return response
        } catch (error) {
            throw error
        }
    }

    async actualizarAsociado(adminAsociado: string, asociado?: string, enlace?: string, image?: string) {
        try {
            const response = await this.repository.actualizarAsociado(adminAsociado, asociado, enlace, image)

            return response
        } catch (error) {
            throw error
        }
    }

    async borrarAsociado(asociado: string) {
        try {
            const response = await this.repository.borrarAsociado(asociado)

            return response
        } catch (error) {
            throw error
        }
    }

    async getProfesionales() {
        try {
            const response = await this.repository.getProfesionales()

            return response
        } catch (error) {
            throw error
        }
    }

    async getTodasImagenes() {
        try {
            const response = await this.repository.getTodasImagenes()

            return response
        } catch (error) {
            throw error
        }
    }

    async getImagenes(artista: string) {
        try {
            const response = await this.repository.getImagenes(artista)
            return response
        } catch (error) {
            throw error
        }
    }

    async galeria(username: string, ruta: string): Promise<any> {
        try {
            const rutaCheck = ruta.replace(/\\/g, "/");

            if (username) {
                const response = await this.repository.galeria(username, rutaCheck)
                return response
            }
        } catch (error) {
            return null
        }
    }

    async borrarImagenGaleria(username: string, ruta: string) {
        try {
            if (username && ruta) {
                const response = await this.repository.borrarImagenGaleria(username, ruta)
                try {
                    await fs.unlink(`${ruta}`);
                } catch (error) {
                    console.error("No se pudo borrar la image:", error);
                }
                return response
            }
        } catch (error) {
            return null
        }
    }

    async crearConsulta(datos: any) {
        try {
            if (!datos) throw new Error('Error en datos de consulta')

            const nombreConsulta = datos.nombreConsulta
            const contactoConsulta = datos.contactoConsulta
            const proyectoConsulta = datos.proyectoConsulta
            const artistaUsername = datos.artistaUsername

            if (nombreConsulta == '' || contactoConsulta == '' || proyectoConsulta == '' || artistaUsername == '') throw new Error('No pueden haber campos vacíos')

            const response = await this.repository.crearConsulta(nombreConsulta, artistaUsername, contactoConsulta, proyectoConsulta)

            return response
        } catch (error) {
            throw error
        }
    }

    async getConsultas(artista: string) {
        try {
            const response = await this.repository.getConsultas(artista)

            return response
        } catch (error) {
            throw error
        }
    }

    async crearReporte(datos: any) {
        try {
            const username = datos.username
            const mensaje = datos.mensaje || ''
            const motivo = datos.motivo || ''

            const response = await this.repository.crearReporte(username, mensaje, motivo)

            return response
        } catch (error) {
            throw error
        }
    }

    async getReportes() {
        try {
            const response = await this.repository.getReportes()

            return response
        } catch (error) {
            throw error
        }
    }

    async borrarReporte(id: string) {
        try {
            const response = await this.repository.borrarReporte(id)

            return response
        } catch (error) {
            throw error
        }
    }

    async crearLike(username: string, usernameLikeado: string) {
        try {
            const response = await this.repository.crearLike(username, usernameLikeado)

            return response
        } catch (error) {
            throw error
        }
    }

    async getLikes(username: string, usernameLikeado: string) {
        try {
            const response = await this.repository.getLikes(username, usernameLikeado)

            return response
        } catch (error) {
            throw error
        }
    }

    async quitarLike(username: string, usernameLikeado: string) {
        try {
            const response = await this.repository.quitarLike(username, usernameLikeado)

            return response
        } catch (error) {
            throw error
        }
    }

    async getMasRecomendados() {
        try {
            const response = await this.repository.getMasRecomendados()

            return response
        } catch (error) {
            throw error
        }
    }

    async getProfesional(username: string) {
        try {
            if (username == '') throw new Error('Pon un usuario')
            if (username.length < 5) throw new Error('Muy pocos caracteres')

            const response = await this.repository.getProfesional(username)

            if (response == null) throw new Error('El usuario no existe')

            return response
        } catch (error) {
            throw error
        }
    }

    async crearOpinion(username: string, opinion: string) {
        try {
            if (opinion == '') throw new Error('Debes escribir algo')
            if (username == '' || username == null) throw new Error('Usuario incorrecto')
            if (opinion.length >= 200) throw new Error ("La opinión no puede tener más de 200 caracteres")

            const response = await this.repository.crearOpinion(username, opinion)

            if (response == null) throw new Error('Error al crear la opinión')
                
            return response
        } catch (error) {
            throw error
        }
    }

    async getOpiniones() {
        try {
            const response = await this.repository.getOpiniones()

            if (response == null) throw new Error('Fallo al obtener opiniones')

            return response
        } catch (error) {
            throw error
        }
    }

     async borrarOpinion(id: string) {
        try {
            const response = await this.repository.borrarOpinion(id)

            return response
        } catch (error) {
            throw error
        }
    }

}

export { Service }
