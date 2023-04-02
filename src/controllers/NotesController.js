const knex = require('../database/knex');

class NotesController{
  async create(req,res){
    //recuperando id do usuário.
    const { user_id } = req.params;
    //recuperando os dados passados pelo body.
    const { title, description , rating, tags } = req.body;

    //adicionando os dados da nota a tabela notes.
    const [ note_id ] = await knex('movies_notes').insert({
        title,
        description,
        rating,
        user_id
    })

    //percorrendo as tags pois elas vem como um array e para cada tag é retornado um array de obj com o id da nota o nome da nota e o id do usuário.
    const tagsInsert = tags.map(name => {
        return{
            note_id,
            name,
            user_id
        }
    });

    //inserindo os dados na tabela de tags.
    await knex('movies_tags').insert(tagsInsert);

    return res.json();

  }

  async show(req,res){
    // recuperando o id da nota.
    const { id } = req.params;
    
    // buscando na tabela movies_notes a nota que tenha o id igual o id recebido.
    const note = await knex('movies_notes').where({ id }).first();
    
    // buscando na tabela movies_tags a tag que tenha o note_id igual ao id recebido.
    const tags = await knex('movies_tags').where({ note_id: id }).orderBy('name');

    // retornando um objeto json com as informações da nota e tags.
    return res.json({
        ...note,
        tags
    })
  }

  async delete(req,res){
    // recuperando o id.
    const { id } = req.params;

    // buscando a nota pelo id e usando a função delete para deleta-la
    await knex('movies_notes').where({ id }).delete();

    return res.json();
  }

  async index(req,res){
    // recuperando os dados através da query.
    const { title, user_id, tags } = req.query;

    let notes;

    // se existir tags vai ser feito um filtro através delas, se não vai ser feito pelo id do usuário
    if(tags){
      const filterTags = tags.split(',').map(tag => tag.trim());

      notes = await knex('movies_tags')
      .select([
        'movies_notes.id',
        'movies_notes.title',
        'movies_notes.user_id'
      ])
      .where('movies_notes.user_id', user_id)
      .whereLike('movies_notes.title', `%${title}%`)
      .whereIn('name', filterTags)
      .innerJoin('movies_notes', 'movies_notes.id', 'movies_tags.note_id')
      .orderBy('movies_notes.title')
    }else{
      notes = await knex('movies_notes')
       .where({ user_id })
       .whereLike('title',`%${title}%`)
       .orderBy('title')
    }

    //filtro no banco de dados aonde o user_id seja igual o id do usuário
    const userTags = await knex('movies_tags').where({ user_id });
    
    const notesWithTags = notes.map(note => {
      const noteTags = userTags.filter(tag => tag.note_id === note.id);

      return {
        ...note,
        tags: noteTags
      }
    })


    return res.json(notesWithTags)
  }

  
}

module.exports = NotesController;