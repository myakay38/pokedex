const mysqlPromise = require('mysql2/promise');

module.exports = (app, db) => {
    
    app.get('/', (re, res)=> {
        return res.json("Backend");
    })

    app.get('/group_members', (req, res)=> {
        const sql = "SELECT * FROM group_members";
        db.query(sql, (err, data)=> {
            if (err) return res.json(err);
            return res.json(data);
        })
    })

    app.get('/pokemon', (req, res) => {
    const uid = req.query.uID;

    const sql = `
        SELECT 
        p.pID AS id,
        p.name,
        p.type1,
        p.type2,
        p.hp,
        p.atk,
        p.def,
        p.spAtk,
        p.spDef,
        p.speed,
        EXISTS (
            SELECT 1 
            FROM MyPokemon mp 
            WHERE mp.pID = p.pID AND mp.uID = ${uid}
        ) AS caught
        FROM Pokedex p
    `;

    db.query(sql, [uid], (err, results) => {
        if (err) {
        console.error("Error fetching Pokémon data:", err);
        return res.status(500).json({ error: "Database error" });
        }

        const formatted = results.map((row) => ({
        id: row.id,
        number: row.id,
        name: row.name,
        types: row.type2 ? [row.type1, row.type2] : [row.type1],
        stats: {
            hp: row.hp,
            attack: row.atk,
            defense: row.def,
            spAttack: row.spAtk,
            spDefense: row.spDef,
            speed: row.speed
        },
        caught: !!row.caught
        }));

        res.json(formatted);
    });
    });

    app.get(`/pokemon/:id`, (req, res) => {
        const pID = req.params.id;
        const sql = `
        SELECT pID, name, type1, type2, hp, atk, def, spAtk, spDef, speed, legendary, description
        FROM Pokedex WHERE pID=${pID};
        `
        db.query(sql, (err, results) => {
            if (err) {
                console.error("Error fetching pokemon's data", err);
                return res.status(500).json({error: "Database error"});
            }

            const formatted = results.map((row) => ({
                id: row.pID,
                name: row.name,
                types: row.type2 ? [row.type1, row.type2] : [row.type1],
                stats: {
                    hp: row.hp,
                    atk: row.atk, 
                    def: row.def, 
                    spAtk: row.spAtk, 
                    spDef: row.spDef, 
                    speed: row.speed
                },
                legendary: row.legendary[0] === 1, 
                description: row.description
            }))
            return res.json(formatted[0]);
        });
    });

    app.get(`/userPokemon/:id`, (req, res) => {
        const id = req.params.id;
        const sql = `
        SELECT instanceID, mp.pID, name, nickname, level, favourite, onteam, type1, type2, hp, atk, def, spAtk, spDef, speed, legendary, description
        FROM Pokedex p, MyPokemon mp WHERE instanceID=${id} AND p.pID=mp.pID;
        `
        db.query(sql, (err, results) => {
            if (err) {
                console.error("Error fetching pokemon's data", err);
                return res.status(500).json({error: "Database error"});
            }

            const formatted = results.map((row) => ({
                id: row.instanceID,
                pID: row.pID,
                name: row.name,
                nickname: row.nickname,
                level: row.level,
                favourite: row.favourite[0]===1,
                onTeam: row.onteam[0]===1,
                types: row.type2 ? [row.type1, row.type2] : [row.type1],
                stats: {
                    hp: row.hp,
                    atk: row.atk, 
                    def: row.def, 
                    spAtk: row.spAtk, 
                    spDef: row.spDef, 
                    speed: row.speed
                },
                legendary: row.legendary[0] === 1, 
                description: row.description
            }))
            return res.json(formatted[0]);
        });
    });
    app.get(`/pokemon/attacks/:id`, (req, res) => {
        const pID = req.params.id;
        const sql = `
        SELECT a.aID, a.attack_name, type, category, power, accuracy, PP, effect, tm
        FROM Attacks a, LearnableAttacks l 
        WHERE pID=${pID} AND a.aID=l.aID;
        `
        db.query(sql, (err, results) => {
            if (err) {
                console.error("Error fetching pokemon's data", err);
                return res.status(500).json({error: "Database error"});
            }

            const formatted = results.map((row) => ({
                id: row.aID,
                name: row.attack_name,
                type: row.type,
                category: row.category,
                stats: {
                    power: row.power,
                    accuracy: row.accuracy, 
                    pp: row.PP
                },
                effect: row.effect,
                TM: row.tm[0]===1
            }))
            return res.json(formatted);
        });
    });

    app.get(`/pokemon/knownAttacks/:id`, (req, res) => {
        const id = req.params.id;
        const sql = `
        SELECT a.aID, a.attack_name, type, category, power, accuracy, PP, effect, tm
        FROM Attacks a, CurrentAttacks c
        WHERE instanceID=${id} AND a.aID=c.aID;
        `
        db.query(sql, (err, results) => {
            if (err) {
                console.error("Error fetching pokemon's data", err);
                return res.status(500).json({error: "Database error"});
            }

            const formatted = results.map((row) => ({
                id: row.aID,
                name: row.attack_name,
                type: row.type,
                category: row.category,
                stats: {
                    power: row.power,
                    accuracy: row.accuracy, 
                    pp: row.PP
                },
                effect: row.effect,
                TM: row.tm[0]===1
            }))
            return res.json(formatted);
        });
    });

    app.get(`/pokemon/evolutions/:id`, (req, res) => {
        const pID = req.params.id;
        const sql = `
        WITH tripleEvo AS (
            SELECT 
            p1.pID as pID1
            , p1.name as name1
            , p1.type1 as type11
            , p1.type2 as type21
            , p2.pID as pID2
            , p2.name as name2
            , p2.type1 as type12
            , p2.type2 as type22
            , p3.pID as pID3
            , p3.name as name3
            , p3.type1 as type13
            , p3.type2 as type23
            FROM evolutions e1, evolutions e2, Pokedex p1, Pokedex p2, Pokedex p3
            WHERE e1.evolvesInto = e2.evolvesFrom AND p1.pID=e1.evolvesFrom 
            AND p2.pID=e1.evolvesInto AND p3.pID=e2.evolvesInto
        ),
        doubleEvo AS (
            SELECT 
            p1.pID as pID1
            , p1.name as name1
            , p1.type1 as type11
            , p1.type2 as type21
            , p2.pID as pID2
            , p2.name as name2
            , p2.type1 as type12
            , p2.type2 as type22
            , NULL as pID3
            , NULL as name3
            , NULL as type13
            , NULL as type23
            FROM evolutions, Pokedex p1, Pokedex p2
            WHERE p1.pID=evolvesFrom AND p2.pID=evolvesInto AND NOT EXISTS (
                SELECT * FROM tripleEvo 
                WHERE (evolvesFrom = pID1 AND evolvesInto = pID2) 
                    OR (evolvesFrom = pID2 AND evolvesInto = pID3)
            )
        )
        SELECT *
        FROM (SELECT * FROM tripleEvo UNION SELECT * FROM doubleEvo) as evo
        WHERE (pID1 = ${pID} OR pID2 = ${pID} OR pID3 = ${pID});
        `;

        const placeholderImg = "/placeholder.png";
        db.query(sql, (err, results) => {
            if (err) {
                console.error("Error fetching pokemon's data", err);
                return res.status(500).json({error: "Database error"});
            }

            const formatted = results.map((row) => ({
                base: {
                    id: row.pID1,
                    name: row.name1,
                    types: row.type21 ? [row.type11, row.type21] : [row.type11],
                    image: placeholderImg
                },
                stage1: {
                    id: row.pID2,
                    name: row.name2,
                    types: row.type22 ? [row.type12, row.type22] : [row.type12],
                    image: placeholderImg
                },
                stage2: {
                    id: row.pID3,
                    name: row.name3,
                    types: row.type23 ? [row.type13, row.type23] : [row.type13],
                    image: placeholderImg
                }
            }));
            return res.json(formatted);
        });
    });

    app.get('/user/:id', (req, res) => {
        const uID = req.params.id;
        const sql = `
            SELECT uID, name, tradeCount, username
            FROM User WHERE uID=${uID};
        `
        db.query(sql, (err, results) => {
            if (err) {
                console.error("Error fetching user's data", err);
                return res.status(500).json({error: "Database error"});
            }
            const formatted = results.map((row) => ({
                id: row.uID,
                displayName: row.name,
                tradeCount: row.tradeCount,
                username: row.username,
            }));
            return res.json(formatted[0]);
        });
    });

    app.get('/teamSummary/:id', (req,res) => {
    const uID = req.params.id;
    const sql = `
        WITH FX as (
        SELECT type1, type2, (
            CASE 
                WHEN double_strength=1 THEN 2
                WHEN half_strength=1 THEN 0.5
                ELSE 0
                END
        ) as effect FROM TypeFX
        ), full as (
        SELECT * FROM FX
            UNION
            SELECT t1.type as type1, t2.type as type2, 1 as effect
            FROM Types t1, Types t2
            WHERE t1.type!=t2.type AND t2.type NOT IN (
            SELECT type2 FROM typeFX t WHERE t.type1=t1.type
        )
        ), crossed1 as (
        SELECT t1.type1 typeA, t2.type1 typeB, t1.type2, 
            (t1.effect*t2.effect) as effect
            FROM full t1, full t2 WHERE t1.type1!=t2.type1 AND t1.type2=t2.type2
        ), crossed2 as (
        SELECT t1.type1, t1.type2 as typeA, t2.type2 as typeB, 
            (t1.effect*t2.effect) as effect
            FROM full t1, full t2 WHERE t1.type1=t2.type1 AND t1.type2!=t2.type2
        )

        SELECT atk.type 
        , SUM(atk.effect)/(SELECT COUNT(*) FROM MyPokemon WHERE uID=${uID} AND onteam=1) as atkSum
        , SUM(def.effect)/(SELECT COUNT(*) FROM MyPokemon WHERE uID=${uID} AND onteam=1) as defSum FROM (
        SELECT type1 type, effect*(
            SELECT COUNT(*) from Pokedex p WHERE pID IN (
            SELECT pID FROM MyPokemon WHERE uID=${uID} AND onteam=1
                )
                AND p.type1=typeA AND p.type2=typeB
        ) as effect
            FROM crossed2 WHERE typeA IN (
            SELECT p.type1 from Pokedex p WHERE pID IN (
            SELECT pID FROM MyPokemon WHERE uID=${uID} AND onteam=1
                )
                AND p.type2=typeB
        ) UNION
            SELECT type1 type, effect*(
            SELECT COUNT(*) from Pokedex p WHERE pID IN (
            SELECT pID FROM MyPokemon WHERE uID=${uID} AND onteam=1
                )
                AND p.type1=full.type2 AND p.type2=""
        ) FROM full WHERE type2 IN (
            SELECT p.type1 FROM Pokedex p WHERE pID IN (
            SELECT pID FROM MyPokemon WHERE uID=${uID} AND onteam=1
                )
                AND p.type2=""
        )
        ) as def, (
        SELECT type2 as type, effect*(
            SELECT COUNT(*) from Pokedex p WHERE pID IN (
            SELECT pID FROM MyPokemon WHERE uID=${uID} AND onteam=1
                )
                AND p.type1=typeA AND p.type2=typeB
        ) as effect
            FROM crossed1 WHERE typeA IN (
            SELECT type1 from Pokedex p WHERE pID IN (
            SELECT pID FROM MyPokemon WHERE uID=${uID} AND onteam=1
                )
                AND p.type2=typeB
        ) UNION
            SELECT type2 type, effect*(
            SELECT COUNT(*) from Pokedex p WHERE pID IN (
            SELECT pID FROM MyPokemon WHERE uID=${uID} AND onteam=1
                )
                AND p.type1=full.type1 AND p.type2=""
        ) as effect FROM full WHERE type1 IN (
            SELECT type1 FROM Pokedex p WHERE pID IN (
            SELECT pID FROM MyPokemon WHERE uID=${uID} AND onteam=1
                )
                AND p.type2=""
        )
        ) as atk WHERE def.type=atk.type
        GROUP BY atk.type;
    `;

    db.query(sql, (err, results) => {
        if (err) {
        console.error("Error fetching user's Pokémon data:", err);
        return res.status(500).json({ error: "Database error" });
        }

        const formatted = results.map((row) => ({
        type: row.type,
        atkAvg: parseFloat(row.atkSum),
        defAvg: parseFloat(row.defSum)===0 ? 100 : 1/row.defSum
        }));

        return res.json(formatted);
    });

    
    });


app.get('/userPokemon', (req, res) => {
  const uID = req.query.uID;
  console.log("Incoming request to /userPokemon with uID:", uID);

  const sql = `
    SELECT
      mp.instanceID AS id,
      p.pID AS number,
      p.name,
      p.type1,
      p.type2,
      p.hp,
      p.atk,
      p.def,
      p.spAtk,
      p.spDef,
      p.speed,
      mp.level,
      mp.nickname,
      mp.showcase,
      mp.onteam
    FROM MyPokemon mp
    JOIN Pokedex p ON mp.pID = p.pID
    WHERE mp.uID = ?
  `;

  db.query(sql, [uID], (err, results) => {
    if (err) {
      console.error("Error fetching user's Pokémon data:", err);
      return res.status(500).json({ error: "Database error" });
    }

    const formatted = results.map((row) => ({
      id: row.id,
      number: row.number,
      name: row.name,
      types: row.type2 ? [row.type1, row.type2] : [row.type1],
      stats: {
        hp: row.hp,
        attack: row.atk,
        defense: row.def,
        spAttack: row.spAtk,
        spDefense: row.spDef,
        speed: row.speed,
      },
      level: row.level,
      nickname: row.nickname,
      showcase: row.showcase[0]===1,
      onTeam: row.onteam[0]===1
    }));

    return res.json(formatted);
  });
});

app.get("/searchUser", async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "No user found" });
  }

  try {
    const db = await mysqlPromise.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const isNumeric = /^\d+$/.test(query);
    const [results] = isNumeric
      ? await db.execute("SELECT uID, name, username FROM User WHERE uID = ?", [query])
      : await db.execute("SELECT uID, name, username FROM User WHERE username LIKE ?", [`%${query}%`]);

    await db.end();
    res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Server error while searching" });
  }
});


}
