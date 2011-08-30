jQuery.base64 = {

/* Convert data (an array of integers) to a Base64 string. */
toBase64Table : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
base64Pad     : '=',

encode: function (data) {
    var result = '',
        chrTable = $.base64.toBase64Table.split(''),
        pad = $.base64.base64Pad,
        length = data.length,
        i;
    // Convert every three bytes to 4 ascii characters.
    for (i = 0; i < (length - 2); i += 3) {
        result += chrTable[data[i] >> 2];
        result += chrTable[((data[i] & 0x03) << 4) + (data[i+1] >> 4)];
        result += chrTable[((data[i+1] & 0x0f) << 2) + (data[i+2] >> 6)];
        result += chrTable[data[i+2] & 0x3f];
    }

    // Convert the remaining 1 or 2 bytes, pad out to 4 characters.
    if (length%3) {
        i = length - (length%3);
        result += chrTable[data[i] >> 2];
        if ((length%3) === 2) {
            result += chrTable[((data[i] & 0x03) << 4) + (data[i+1] >> 4)];
            result += chrTable[(data[i+1] & 0x0f) << 2];
            result += pad;
        } else {
            result += chrTable[(data[i] & 0x03) << 4];
            result += pad + pad;
        }
    }

    return result;
},

/* Convert Base64 data to a string */
toBinaryTable : [
    -1,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,-1,
    -1,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,-1,
    -1,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,62, -1,-1,-1,63,
    52,53,54,55, 56,57,58,59, 60,61,-1,-1, -1, 0,-1,-1,
    -1, 0, 1, 2,  3, 4, 5, 6,  7, 8, 9,10, 11,12,13,14,
    15,16,17,18, 19,20,21,22, 23,24,25,-1, -1,-1,-1,-1,
    -1,26,27,28, 29,30,31,32, 33,34,35,36, 37,38,39,40,
    41,42,43,44, 45,46,47,48, 49,50,51,-1, -1,-1,-1,-1
],

decode: function (data, offset) {
    offset = typeof(offset) !== 'undefined' ? offset : 0;
    var binTable = $.base64.toBinaryTable,
        pad = $.base64.base64Pad,
        result, result_length, idx, i, c, padding,
        leftbits = 0, // number of bits decoded, but yet to be appended
        leftdata = 0, // bits decoded, but yet to be appended
        data_length = data.indexOf('=') - offset;

    if (data_length < 0) { data_length = data.length - offset; }

    /* Every four characters is 3 resulting numbers */
    result_length = (data_length >> 2) * 3 + Math.floor((data_length%4)/1.5);
    result = new Array(result_length);

    // Convert one by one.
    for (idx = 0, i = offset; i < data.length; i++) {
        c = binTable[data.charCodeAt(i) & 0x7f];
        padding = (data.charAt(i) === pad);
        // Skip illegal characters and whitespace
        if (c === -1) {
            console.error("Illegal character '" + data.charCodeAt(i) + "'");
            continue;
        }
        
        // Collect data into leftdata, update bitcount
        leftdata = (leftdata << 6) | c;
        leftbits += 6;

        // If we have 8 or more bits, append 8 bits to the result
        if (leftbits >= 8) {
            leftbits -= 8;
            // Append if not padding.
            if (!padding) {
                result[idx++] = (leftdata >> leftbits) & 0xff;
            }
            leftdata &= (1 << leftbits) - 1;
        }
    }

    // If there are any bits left, the base64 string was corrupted
    if (leftbits) {
        throw {name: 'Base64-Error', 
               message: 'Corrupted base64 string'};
    }

    return result;
}

}; /* End of Base64 namespace */
