const { hash, compare } = require('bcryptjs');
const AppError = require('../utils/AppError');

const knex = require('../database/knex');

class UsersController {
    async create(req, res) {
        // Recuperando os dados passados pelo body.
        const { name, email, password } = req.body;

        // Verifica se o email já existe no banco.
        const checkUserExists = await knex('users').where('email', email).first()

        // Se sim lança uma excessão.
        if (checkUserExists) {
            throw new AppError('Este e-mail já está em uso');
        }

        // Cria hash da senha informada pelo usuário
        const hashedPassword = await hash(password, 8);

        // Insere dados do usuário no banco
        await knex('users').insert({
            name,
            email,
            password: hashedPassword
        })

        // Retorna status 201 e um objeto JSON
        return res.status(201).json()
    }

    async update(req, res) {
        // Recuperando o id passado pela rota.
        const { id } = req.params;

        // Recuperando os dados passados pelo body.
        const { name, email, password, old_password } = req.body;

        // Verifica se o usuário existe.
        const user = await knex('users').where('id', id).first();

        // Se user for false então é lançado uma excessão.
        if (!user) {
            throw new AppError('Usuário não encontrado.');
        }

        // Verifica se email salvo no banco é igual email recebido pelo body.
        const userWithUpdatedEmail = await knex('users').where('email', email).first();

        // userWithUpdatedEmail verifica se algum usuário no banco de dados foi encontrado com esse email.
        // userWithUpdatedEmail.id !== user.id verifica se o id do usuário salvo no banco é diferente do id do usuário que está tentando fazer a atualização
        if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
            throw new AppError('Este e-mail já está em uso');
        }

        // Atualizando o name e email.
        user.name = name ?? user.name;
        user.email = email ?? user.email;

        // Verifica se a senha antiga não foi informada e lança uma excessão.
        if (password && !old_password) {
            throw new AppError(
                'Você precisa informar a senha antiga para definir a nova.')
        }

        
        if (password && old_password) {
            // Com o compare a senha que foi recebida pelo body e a salva no banco são verificadas, ambas precisam ter o mesmo valor.
            const checkOldPassword = await compare(old_password, user.password);

            // checkOldPassword = false então é lançada uma excessão.
            if (!checkOldPassword) {
                throw new AppError('A senha antiga não confere');
            }

            // Por fim a senha é atualizada.
            user.password = await hash(password, 8)
        }

        // Atualização dos dados do usuário no banco.
        await knex('users')
            .where('id', id)
            .update({
                name: user.name,
                email: user.email,
                password: user.password,
                updated_at: knex.raw('DATETIME("now")')
            });

        return res.json()
    }

}

module.exports = UsersController;