import pool from '../db/db.js'; //ini ngambil variabel pool dari db js tadi

//end point notes to db
router.post('/notes', async (req, res) => {
    const client = await pool.connect();

    try{
        const { title } = req.body;
        const user_id = req.body.user_id;
        console.log('received body', req.body)
        if (!title || !user_id) {
            return res.status(400).json({ message: 'Missing field'})
        }
    
    await client.query('BEGIN');

    const result = await client.query(
        'INSERT INTO notes (title) VALUES ($1) RETURNING id, title',
        [title]
    );

    const note = result.rows[0];

    await client.query(
        'INSERT INTO galleries (note_id, user_id) VALUES ($1, $2)',
        [note.id, user_id]
    )

    await client.query('COMMIT');

    res.status(201).json({ note });
    } catch (error) {
        await client.query('ROLLBACK')
        console.error(error);
        res.status(500).json({ message: 'Server Error'});
    } finally {
        client.release()
    }
})

//query judul note ke UI
router.get('/gallery/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;

        const result = await pool.query(
            `SELECT n.id, n.title
            FROM notes n 
            JOIN galleries g ON n.id = g.note_id
            WHERE g.user_id = $1`,
            [user_id]);

        res.json({ notes: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error'});
    }
})

router.get('/note/:note_id', async (req, res) => {
    try {
        const { note_id } = req.params;

        const result = await pool.query(
            'SELECT * FROM notes WHERE id = $1',
            [note_id] 
        )
        res.status(200).json({ note: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error'});
    }
})

router.put('/note/:note_id', async (req, res) => {
  try {
    console.log("PUT HIT:", req.params, req.body);

    const { note_id } = req.params;
    const { contents } = req.body;

    const result = await pool.query(
      'UPDATE notes SET contents = $1 WHERE id = $2 RETURNING *',
      [contents, note_id]
    );

    console.log("QUERY RESULT:", result.rows);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "note not found" });
    }

    res.status(200).json({ note: result.rows[0] });
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ message: "server error" });
  }
});

router.delete('/note/:note_id', async (req, res) => {
    try {
        console.log("DELETED", req.params);

        const { note_id } = req.params;

        const result = await pool.query(
            'DELETE FROM notes WHERE id = $1 RETURNING *',
            [note_id]
        )

        if (result.rowCount === 0) {
            console.log("gaada nih datanya di db")
        }

        res.json({ 
            message: "datanya sudah dihapus, jangan nanain dia lagi ya.",
            data: result.rows[0]
         })

    } catch (error) { 
        console.error(error)
        res.status(500).json({ message: "server ngebug" })
    }
})