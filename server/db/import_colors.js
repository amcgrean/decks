const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const QUERIES_DIR = path.join(__dirname, '..', '..', 'queries');

const db = new Database(path.join(DATA_DIR, 'beisser.db'));

const checkStmt = db.prepare(`SELECT id FROM products WHERE brand = ? AND color_name = ? COLLATE NOCASE`);
const updateStmt = db.prepare(`UPDATE products SET slug = ?, hex = ?, image_url = ?, collection = ? WHERE id = ?`);
const insertStmt = db.prepare(`INSERT INTO products (brand, brand_name, collection, color_name, slug, hex, image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
let maxSortOrder = db.prepare(`SELECT MAX(sort_order) as m FROM products`).get().m || 0;

const dirs = fs.readdirSync(QUERIES_DIR);
for (const dir of dirs) {
    if (dir.endsWith('_output')) {
        let brandId = dir.replace('_output', '');
        let brandName = brandId.charAt(0).toUpperCase() + brandId.slice(1);
        const dirPath = path.join(QUERIES_DIR, dir);
        const files = fs.readdirSync(dirPath).filter(f => !fs.statSync(path.join(dirPath, f)).isDirectory());

        let targetJson = files.find(f => f.includes('cleaned.json'));
        if (!targetJson) targetJson = files.find(f => f.endsWith('.json'));

        if (targetJson) {
            const data = JSON.parse(fs.readFileSync(path.join(dirPath, targetJson), 'utf-8'));
            console.log(`Processing ${brandName} from ${targetJson}`);

            const processArray = (collection, items) => {
                for (const color of items) {
                    const cname = color.name || color.color;
                    if (!cname) continue;

                    // Special case for Fasteners in Trex
                    if (cname === 'Fasteners') continue;

                    const slug = color.slug || null;
                    const hex = color.hex || color.hex_code || null;
                    const img = color.image_url || color.swatch_image || null;

                    let actualBrandId = brandId;
                    let actualBrandName = brandName;
                    let actualCollection = collection;

                    if (brandId === 'timbertech') {
                        if (collection.includes('Harvest') || collection.includes('Landmark') || collection.includes('Vintage')) {
                            actualBrandId = 'azek';
                            actualBrandName = 'AZEK';
                        }
                    }

                    if (brandId === 'armadillo' && actualCollection === 'Unknown') {
                        actualCollection = 'Evolution';
                    }

                    const row = checkStmt.get(actualBrandId, cname);
                    if (row) {
                        updateStmt.run(slug, hex, img, actualCollection, row.id);
                    } else {
                        maxSortOrder++;
                        insertStmt.run(actualBrandId, actualBrandName, actualCollection, cname, slug, hex, img, maxSortOrder);
                    }
                }
            };

            if (Array.isArray(data)) {
                processArray("Unknown", data);
            } else {
                for (const [collection, items] of Object.entries(data)) {
                    processArray(collection, items);
                }
            }
        }
    }
}
console.log("Import script completed.");
