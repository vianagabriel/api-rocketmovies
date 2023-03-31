const { hash , compare} = require('bcryptjs');
const AppError = require('../utils/AppError');

const knex = require('../database/knex');

class UsersController {
    async create(req, res) {
        const { name, email, password } = req.body;

        //verificar se o email fornecido já existe na tabela usuário do banco de dados.
        const checkUserExists = await knex('users').where('email', email).first()


        if (checkUserExists) {
            throw new AppError('Este e-mail já está em uso');
        }

        //fazendo a cripto da senha do usuário
        const hashedPassword = await hash(password, 8);

        //adicionando as informações a tabela de usuários
        await knex('users').insert({
            name,
            email,
            password: hashedPassword
        })

        return res.status(201).json()
    }

    async update(req,res){
        const { id } = req.params;
        const { name, email, password, old_password } = req.body;
 
        //verificando se na tabela users onde o id salvo no banco seja o mesmo do id informado pelo usuário.
        const user = await knex('users').where('id', id).first();

        if(!user){
            throw new AppError('Usuário não encontrado.');
        }

        //checando se o email passado pelo usúario é o mesmo salvo no banco e retornando o primeiro
        const userWithUpdatedEmail = await knex('users').where('email', email).first();

        //se o email cadastrado no banco e o id do usuário no banco for diferente do id que o usuário está passando então lança um erro
        if(userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id){
            throw new AppError('Este e-mail já está em uso');
        }

        //substituindo o valor antigo pelo novo valor, porém se não for passado o name e o email manter as informações antigas
        user.name = name ?? user.name;
        user.email = email ?? user.email;

        if(password && !old_password){
            throw new AppError(
            'Você precisa informar a senha antiga para definir a nova.')
          }
        
        if(password && old_password){
            const checkOldPassword = await compare(old_password, user.password);
            
            if(!checkOldPassword){
              throw new AppError('A senha antiga não confere');
            }

            user.password = await hash(password,8)
          }

          //na tabela usuário onde o id salvo seja o mesmo informado pelo bady então atualize as seguintes informações
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