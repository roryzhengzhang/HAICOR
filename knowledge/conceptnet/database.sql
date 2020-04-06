/* languages table */
CREATE TABLE languages (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT    UNIQUE NOT NULL,
    name TEXT    NOT NULL
);

INSERT INTO languages(code, name)
SELECT code, name
FROM languages_raw
ORDER BY code;

DROP TABLE languages_raw;

/* part_of_speeches table */
CREATE TABLE part_of_speeches (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT    UNIQUE NOT NULL,
    name TEXT    NOT NULL
);

INSERT INTO part_of_speeches(code, name)
SELECT code, name
FROM part_of_speeches_raw
ORDER BY code;

DROP TABLE part_of_speeches_raw;

/* concepts table */
CREATE TABLE concepts (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    lang   INTEGER NOT NULL,
    text   TEXT    NOT NULL,
    speech INTEGER,
    suffix TEXT,
    uri    TEXT    UNIQUE NOT NULL,

    UNIQUE(lang, text, speech, suffix)
);

INSERT INTO concepts(lang, text, speech, suffix, uri)
SELECT DISTINCT languages.id, text, part_of_speeches.id, suffix, uri
FROM
(
    SELECT
        source_language AS lang,
        source_text AS text,
        source_pos AS speech,
        source_suffix AS suffix,
        source_uri AS uri
    FROM assertions_raw
    UNION
    SELECT
        target_language AS lang,
        target_text AS text,
        target_pos AS speech,
        target_suffix AS suffix,
        target_uri AS uri
    FROM assertions_raw
) 
LEFT JOIN languages ON lang == languages.code
LEFT JOIN part_of_speeches ON speech == part_of_speeches.code
ORDER BY lang, text, speech, suffix;

/* relations table */
CREATE TABLE relations (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    relation TEXT    UNIQUE NOT NULL,
    directed INTEGER NOT NULL
);

INSERT INTO relations(relation, directed)
SELECT relation, directed == 'directed'
FROM relations_raw
ORDER BY relation;

DROP TABLE relations_raw;

/* datasets table */
CREATE TABLE datasets (
    id  INTEGER PRIMARY KEY AUTOINCREMENT,
    uri TEXT    UNIQUE NOT NULL
);

INSERT INTO datasets(uri)
SELECT DISTINCT SUBSTR(JSON_EXTRACT(data, '$.dataset'), 4, 
                       LENGTH(JSON_EXTRACT(data, '$.dataset')) - 3)
FROM assertions_raw
ORDER BY uri;

/* licenses table */
CREATE TABLE licenses (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT    UNIQUE NOT NULL
);

INSERT INTO licenses(name)
SELECT DISTINCT JSON_EXTRACT(data, '$.license')
FROM assertions_raw
ORDER BY JSON_EXTRACT(data, '$.license');

/* assertions table */
CREATE TABLE assertions (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    relation_id    INTEGER         NOT NULL,
    source_id      INTEGER         NOT NULL,
    target_id      INTEGER         NOT NULL,
    dataset_id     INTEGER         NOT NULL,
    license_id     INTEGER         NOT NULL,
    surface_text   TEXT,
    surface_source TEXT,
    surface_target TEXT,
    weight         REAL,
    data           TEXT            NOT NULL
);

INSERT INTO assertions(relation_id, source_id, target_id, dataset_id, license_id,
                       surface_text, surface_source, surface_target, weight, data)
SELECT
    relations.id,
    source.id,
    target.id,
    datasets.id,
    licenses.id,
    JSON_EXTRACT(data, '$.surfaceText'),
    JSON_EXTRACT(data, '$.surfaceStart'),
    JSON_EXTRACT(data, '$.surfaceEnd'),
    JSON_EXTRACT(data, '$.weight'),
    data
FROM assertions_raw
JOIN relations ON relations.relation == assertions_raw.relation
JOIN concepts source ON source.uri == assertions_raw.source_uri
JOIN concepts target ON target.uri == assertions_raw.target_uri
JOIN datasets ON datasets.uri == SUBSTR(JSON_EXTRACT(data, '$.dataset'), 4, 
                                        LENGTH(JSON_EXTRACT(data, '$.dataset')) - 3)
JOIN licenses ON licenses.name == JSON_EXTRACT(data, '$.license');

DROP TABLE assertions_raw;
