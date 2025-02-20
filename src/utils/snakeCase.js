
function toSnakeCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
}

// Function to convert all keys of an object or array of objects to snake_case
function convertKeysToSnakeCase(data) {
    if (Array.isArray(data)) {
        // If data is an array, map through each item and convert its keys
        return data.map(item => {
            if (item.toObject) {
                item = item.toObject(); // Convert Mongoose doc to plain object if needed
            }
            // Convert keys of the object to snake_case
            const convertedItem = {};
            Object.keys(item).forEach(key => {
                const snakeKey = toSnakeCase(key);
                convertedItem[snakeKey] = item[key];
            });
            return convertedItem;
        });
    } else if (typeof data === 'object' && data !== null) {
        // If data is a single object, convert its keys
        const convertedData = {};
        Object.keys(data).forEach(key => {
            const snakeKey = toSnakeCase(key);
            convertedData[snakeKey] = data[key];
        });
        return convertedData;
    }
    return data; // If not an object or array, return as is
}


export default convertKeysToSnakeCase;