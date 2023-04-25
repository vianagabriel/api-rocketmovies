
const knex = require('../database/knex');


class TagsController{
    async index(req,res){
      const  user_id  = req.user.id;

      const tags = await knex('movies_tags').where({ user_id })

      return res.json(tags)
    }
}

module.exports = TagsController;