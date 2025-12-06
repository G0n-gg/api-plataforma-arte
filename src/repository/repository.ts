import { databaseHost, databaseName, databaseUser, databasePort, databasePassWord } from '../config'
import mysql from 'mysql2/promise'
import { Usuarios } from '../models/usuarios'
import { Asociados } from '../models/asociados'

class Repository {

    private connection: mysql.Connection | null = null

    constructor() { }

    async connect(): Promise<void> {
        try {
             if (!this.connection) {
            this.connection = await mysql.createConnection({
                host: databaseHost,
                user: databaseUser,
                password: databasePassWord,
                database: databaseName,
                port: databasePort
            })
            console.log('BBDD conectada')
        }
        else {
            console.log('BBDD no conectada')
        }
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async disconnect(): Promise<void> {
        if (this.connection) {
            await this.connection.end()
            this.connection = null
            console.log('BBDD desconectada')
        }
    }

    async connectando(): Promise<void> {
        try {
            if (!this.connection) {
            await this.connect()
        }
        } catch (error) {
            throw error
        } 
    }

    async crearUsuario(datos: Usuarios): Promise<Usuarios> {
        try {
            if (!this.connection) {
            await this.connect()
        }

        if (datos.esArtista) {
            const esArtista = 'artista'
            await this.connection!.execute('INSERT INTO usuarios (tipo, email, username, password) VALUES (?, ?, ?, ?)',
                [esArtista, datos.email, datos.username, datos.password]
            )
        }
        else if (datos.esArtista == false) {
            const esCliente = 'cliente'
            await this.connection!.execute('INSERT INTO usuarios (tipo, email, username, password) VALUES (?, ?, ?, ?)',
                [esCliente, datos.email, datos.username, datos.password]
            )
        }

        const dataOculta = { ...datos, rpassword: '', password: '', }
        return dataOculta
        } catch (error) {
            throw error
        }
        
    }

    async loginLogs(nombreUsuario: string, fecha: string, hora: string) {
        if (!this.connection) {
            await this.connect()
        }

        const [sentencia] = await this.connection!.execute('INSERT INTO logins (usuario, fecha, hora) VALUES (?, ?, ?)',
            [nombreUsuario, fecha, hora]
        )

        if ((sentencia as any[]).length == 0) return null
    }

    async getLogins() {
        if (!this.connection) {
            await this.connect()
        }

        const [sentencia] = await this.connection!.execute('SELECT * from logins')

        if ((sentencia as any[]).length == 0) return null

        return [sentencia][0]
    }

    async getUsuario(username: string): Promise<Usuarios | null> {
        if (!this.connection) {
            await this.connect();
        }

        const [sentencia] = await this.connection!.execute('SELECT username, tipo, email, password, descripcion, imagenperfil FROM usuarios WHERE username = ?', [username]);
        const datos = sentencia as Usuarios[];

        if (datos.length == 0) return null

        if (datos[0]) {
            return datos[0]
        }
        else
            return null
    }

    async getUsuarioNopass(username: string): Promise<Usuarios | null> {
        if (!this.connection) {
            await this.connect();
        }

        const [sentencia] = await this.connection!.execute('SELECT username, tipo, email, descripcion, imagenperfil FROM usuarios WHERE username = ?', [username]);
        const datos = sentencia as Usuarios[];

        if (datos.length == 0) return null

        if (datos[0]) {
            return datos[0]
        }
        else
            return null
    }

    async getUsuarioEmail(email: string): Promise<Usuarios | null> {
        if (!this.connection) {
            await this.connect();
        }

        const [sentenciaEmail] = await this.connection!.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
        const dataEmail = sentenciaEmail as Usuarios[];

        if (dataEmail.length == 0) return null

        if (dataEmail[0]) {
            return dataEmail[0]
        }
        else
            return null
    }

    async cambiarPassword(username: string, newPassword: string) {
        try {
            const sentencia = await this.connection!.execute('UPDATE usuarios SET password = ? WHERE username = ? ', [newPassword, username])

            if ((sentencia as any[]).length == 0) return null
        } catch (error) {
            throw error
        }
    }

    async actualizarImagenUsuario(username: string, ruta: string): Promise<any> {
        try {
            if (!this.connection) {
                await this.connect()
            }
            const [sentencia]: any = await this.connection!.execute('UPDATE usuarios SET imagenperfil = ? WHERE username = ?', [ruta, username])

            if ((sentencia as any[]).length == 0) return null
            return ruta
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async cambiarDescripcion(username: string, descripcion: string) {
        try {
            if (!this.connection) {
                await this.connect()
            }

            await this.connection!.execute('UPDATE usuarios SET descripcion = ? WHERE username = ?', [descripcion, username])
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async actualizarUsuario(adminUser: string, username?: string, email?: string, descripcion?: string, priorizar?: string) {
        try {
            if (!this.connection) {
                await this.connect()
            }

            if (username) await this.connection!.execute('UPDATE usuarios SET username = ? WHERE username = ?', [username, adminUser])
            if (email) await this.connection!.execute('UPDATE usuarios SET email = ? WHERE username = ?', [email, adminUser])
            if (descripcion) await this.connection!.execute('UPDATE usuarios SET descripcion = ? WHERE username = ?', [descripcion, adminUser])
            if (priorizar) await this.connection!.execute('UPDATE usuarios SET priorizar = ? WHERE username = ?', [priorizar, adminUser])

        } catch (error) {
            console.log(error)
            return null
        }
    }

    async borrarUsuario(username: string) {
        try {
            if (!this.connection) {
                await this.connect()
            }

            const [sentencia]: any = await this.connection!.execute('DELETE FROM usuarios WHERE username = ?', [username])
            return sentencia.affectedRows > 0 ? true : null
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async getCliente(username: string): Promise<any> {
        if (!this.connection) {
            await this.connect()
        }

        const [sentencia] = await this.connection!.execute('SELECT * FROM clientes WHERE username = ?', [username])
        const datos = sentencia as Usuarios[]

        if ((sentencia as any[]).length == 0) return null

        return datos[0]
    }

    async actualizarCliente(id: number): Promise<any> {
        if (!this.connection) {
            await this.connect()
        }

        const [sentencia] = await this.connection!.execute('UPDATE clientes SET password WHERE id = ?', [id])

        if ((sentencia as any[]).length == 0) return null
        return ''
    }

    async getTodosClientes(): Promise<any> {
        if (!this.connection) {
            await this.connect()
        }

        const [sentencia] = await this.connection!.execute('SELECT * FROM clientes')

        if ((sentencia as any[]).length == 0) return null
        return sentencia
    }

    async crearAsociado(datos: Asociados) {
        if (!this.connection) {
            await this.connect()
        }

        const [sentencia] = await this.connection!.execute('INSERT INTO asociados (nombreAsociado, enlace, imagen) VALUES (?, ?, ?)',
            [datos.nombreAsociado, datos.enlaceAsociado, datos.imagenAsociado])
        return sentencia
    }

    async getAsociado(asociado: string) {
        if (!this.connection) {
            await this.connect()
        }

        const [sentencia] = await this.connection!.execute('SELECT * FROM asociados WHERE nombreAsociado = ?', [asociado])
        const datos = sentencia as Asociados[]

        if (datos.length === 0) return null

        return datos[0]
    }

    async getAsociados() {
        if (!this.connection) {
            await this.connect()
        }

        const [sentencia] = await this.connection!.execute('SELECT * FROM asociados')
        return sentencia
    }

    async actualizarAsociado(adminAsociado: string, asociado?: string, enlace?: string, imagen?: string) {
        try {
            if (!this.connection) {
                await this.connect()
            }

            if (asociado) await this.connection!.execute('UPDATE asociados SET nombreAsociado = ? WHERE nombreAsociado = ?', [asociado, adminAsociado])

            if (enlace) await this.connection!.execute('UPDATE asociados SET enlace = ? WHERE nombreAsociado = ?', [enlace, adminAsociado])

            if (imagen) await this.connection!.execute('UPDATE asociados SET imagen = ? WHERE nombreAsociado = ?', [imagen, adminAsociado])
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async borrarAsociado(asociado: string) {
        try {
            if (!this.connection) {
                await this.connect()
            }

            if (asociado) await this.connection!.execute('DELETE FROM asociados WHERE nombreAsociado = ?', [asociado])
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async getProfesionales() {
        try {
            if (!this.connection) {
                await this.connect()
            }

            const [sentencia] = await this.connection!.execute('SELECT id, tipo, email, username, descripcion, imagenperfil, priorizar FROM usuarios WHERE tipo = ?', ['artista'])

            if ((sentencia as any[]).length == 0) return null

            return [sentencia][0]
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async getTodasImagenes() {
        try {
            if (!this.connection) {
                await this.connect()
            }

            const [sentencia] = await this.connection!.execute('SELECT * FROM imagenes')

            if ((sentencia as any[]).length == 0) return null

            return [sentencia][0]
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async getImagenes(artista: string) {
        try {
            if (!this.connection) {
                await this.connect()
            }

            const [sentencia] = await this.connection!.execute('SELECT * FROM imagenes WHERE artista_username = ?', [artista])

            if ((sentencia as any[]).length == 0) return []

            return [sentencia][0]
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async galeria(username: string, ruta: string) {
        try {
            if (!this.connection) {
                await this.connect()
            }

            await this.connection!.execute('INSERT INTO imagenes (ruta, artista_username) VALUES (?, ?)',
                [ruta, username])

            const [imagen] = await this.connection!.execute('SELECT * FROM imagenes WHERE ruta = ?', [ruta])

            if ((imagen as any[]).length == 0) return null

            return [imagen][0]
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async borrarImagenGaleria(username: string, ruta: string) {
        try {
            if (!this.connection) {
                await this.connect()
            }

            const [sentencia] = await this.connection!.execute('DELETE FROM imagenes WHERE ruta = ? AND artista_username = ?',
                [ruta, username])

            if ([sentencia].length > 0) return ruta
        } catch (error) {
            return null
        }
    }

    async crearConsulta(cliente: string, artista: string, contacto: string, consulta: string) {
        try {
            if (!this.connection) {
                await this.connect()
            }

            const [sentencia] = await this.connection!.execute('INSERT INTO consultas (consulta, contacto, artista_username, cliente) VALUES (?, ?, ?, ?)', [consulta, contacto, artista, cliente])

            if ((sentencia as any[]).length == 0) return null

            return [sentencia][0]
        } catch (error) {
            return error
        }
    }

    async getConsultas(artista: string) {
        try {
            if (!this.connection) {
                await this.connect()
            }

            const [sentencia] = await this.connection!.execute('SELECT * FROM consultas WHERE artista_username = ?', [artista])

            if ((sentencia as any[]).length == 0) return null

            return ([sentencia][0])
        } catch (error) {
            return error
        }
    }

    async crearReporte(username: string, mensaje: string, motivo: string) {
        try {
            if (!this.connection) {
                await this.connect()
            }

            const [sentencia] = await this.connection!.execute('INSERT INTO reportes (username, mensaje, motivo) VALUES (?, ? ,?)', [username, mensaje, motivo])

            if ((sentencia as any[]).length == 0) return null

            return ([sentencia][0])
        } catch (error) {
            return error
        }
    }

    async getReportes() {
        try {
            if (!this.connection) {
                await this.connect()
            }

            const [sentencia] = await this.connection!.execute('SELECT * FROM reportes')

            if ((sentencia as any[]).length == 0) return null

            return ([sentencia][0])
        } catch (error) {
            return error
        }
    }

    async borrarReporte(id: string) {
        try {
            if (!this.connection) {
                await this.connect()
            }

            const [sentencia] = await this.connection!.execute('DELETE FROM reportes WHERE id = ?', [id])

            if ((sentencia as any[]).length == 0) return null

            return ([sentencia][0])
        } catch (error) {
            return error
        }
    }

    async crearLike(username: string, usernameLikeado: string) {
        try {
            if (!this.connection) {
                await this.connect()
            }

            const [sentencia] = await this.connection!.execute('INSERT INTO likes (username, username_likeado) VALUES(?, ?)', [username, usernameLikeado])

            if ((sentencia as any[]).length == 0) return null

            return ([sentencia][0])
        } catch (error) {
            return error
        }
    }

    async getLikes(username: string, usernameLikeado: string) {
        try {
            if (!this.connection) {
                await this.connect()
            }

            const [sentencia] = await this.connection!.execute('SELECT * FROM likes WHERE username = ? AND username_likeado = ?', [username, usernameLikeado])

            if ((sentencia as any[]).length == 0) return null
            return ([sentencia][0])
        } catch (error) {
            console.log(error)
            return error
        }
    }

    async quitarLike(username: string, usernameLikeado: string) {
        try {
            if (!this.connection) {
                await this.connect()
            }

            const [sentencia] = await this.connection!.execute('DELETE FROM likes WHERE username = ? AND username_likeado = ?', [username, usernameLikeado])

            if ((sentencia as any[]).length == 0) return null
            return ([sentencia][0])
        } catch (error) {
            console.log(error)
            return error
        }
    }

    async getMasRecomendados() {
        try {
            if (!this.connection) {
                await this.connect()
            }

            const [sentencia] = await this.connection!.execute(
                'SELECT id, username, imagenperfil FROM usuarios WHERE tipo = ? AND username IN (SELECT DISTINCT username_likeado FROM likes)', ['artista']);

            if ((sentencia as any[]).length == 0) return null

            return ([sentencia][0])
        } catch (error) {
            console.log(error)
            return error
        }
    }

    async getProfesional(username: string) {
        try {
            if (!this.connection) {
                await this.connect()
            }

            const [sentencia] = await this.connection!.execute('SELECT id, tipo, email, username, descripcion, imagenperfil FROM usuarios WHERE tipo = "artista" AND username = ?', [username])

            if ((sentencia as any[]).length == 0) return null

            return ([sentencia][0])
        } catch (error) {
            throw error
        }
    }

    async crearOpinion(username: string, opinion: string) {
        try {
            if (!this.connection) {
                await this.connect()
            }

            const [sentencia] = await this.connection!.execute('INSERT INTO opiniones (username, opinion) VALUES (?, ?)', [username, opinion])

            if ((sentencia as any[]).length == 0) return null

            return ([sentencia][0])
        } catch (error) {
            throw error
        }
    }

    async getOpiniones() {
        try {
            if (!this.connection) {
                await this.connect()
            }

            const [sentencia] = await this.connection!.execute('SELECT * FROM opiniones')

            if ((sentencia as any[]).length == 0) return null

            return ([sentencia][0])
        } catch (error) {
            throw error
        }
    }

    async borrarOpinion(id: string) {
        try {
            if (!this.connection) {
                await this.connect()
            }

            const [sentencia] = await this.connection!.execute('DELETE FROM opiniones WHERE id = ?', [id])

            if ((sentencia as any[]).length == 0) return null

            return ([sentencia][0])
        } catch (error) {
            return error
        }
    }
}

export { Repository }