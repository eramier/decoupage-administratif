const {readCsvFile} = require('./util')

function parseTypeLiaison(TNCC) {
  return Number.parseInt(TNCC, 10)
}

async function extractDepartements(path) {
  const rows = await readCsvFile(path)

  return rows.map(row => {
    return {
      code: row.dep,
      region: row.reg,
      chefLieu: row.cheflieu,
      nom: row.libelle,
      typeLiaison: parseTypeLiaison(row.tncc)
    }
  })
}

async function extractRegions(path) {
  const rows = await readCsvFile(path)

  return rows.map(row => {
    return {
      code: row.reg,
      chefLieu: row.cheflieu,
      nom: row.libelle,
      typeLiaison: parseTypeLiaison(row.tncc)
    }
  })
}

async function extractArrondissements(path) {
  const rows = await readCsvFile(path)

  return rows.map(row => {
    return {
      code: row.arr,
      departement: row.dep,
      region: row.reg,
      chefLieu: row.cheflieu,
      nom: row.libelle,
      typeLiaison: parseTypeLiaison(row.tncc)
    }
  })
}

function getRangChefLieu(codeCommune, chefsLieuxArrondissement, chefsLieuxDepartement, chefsLieuxRegion) {
  if (chefsLieuxRegion.includes(codeCommune)) {
    return 4
  }

  if (chefsLieuxDepartement.includes(codeCommune)) {
    return 3
  }

  if (chefsLieuxArrondissement.includes(codeCommune)) {
    return 2
  }

  return 0
}

async function extractCommunes(path, arrondissements, departements, regions) {
  const rows = await readCsvFile(path)
  const chefsLieuxRegion = regions.map(e => e.chefLieu)
  const chefsLieuxDepartement = departements.map(r => r.chefLieu)
  const chefsLieuxArrondissement = arrondissements.map(r => r.chefLieu)

  const communes = rows.map(row => {
    const commune = {
      code: row.com,
      nom: row.libelle,
      typeLiaison: parseTypeLiaison(row.tncc)
    }

    if (row.typecom === 'COM') {
      commune.arrondissement = row.arr
      commune.departement = row.dep
      commune.region = row.reg
      commune.type = 'commune-actuelle'
      commune.rangChefLieu = getRangChefLieu(row.com, chefsLieuxArrondissement, chefsLieuxDepartement, chefsLieuxRegion)
    }

    if (row.typecom === 'COMA') {
      commune.type = 'commune-associee'
      commune.chefLieu = row.comparent
    }

    if (row.typecom === 'COMD') {
      commune.type = 'commune-deleguee'
      commune.chefLieu = row.comparent
    }

    if (row.typecom === 'ARM') {
      commune.type = 'arrondissement-municipal'
      commune.commune = row.comparent
    }

    return commune
  })

  return communes
}

module.exports = {extractDepartements, extractRegions, extractArrondissements, extractCommunes}
