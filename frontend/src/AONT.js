export default class AONT {
    constructor() {
        this.CANARY_SIZE = 16;
        this.KEY_SIZE = 32;
    }

    async generateKey() {
        return crypto.getRandomValues(new Uint8Array(this.KEY_SIZE));
    }

    async encrypt(data, key, nonce) {
        if (!(key instanceof Uint8Array) || key.length !== this.KEY_SIZE) {
            throw new Error(`Key must be a Uint8Array of length ${this.KEY_SIZE}`);
        }
        if (!(nonce instanceof Uint8Array) || nonce.length !== 12) {
            throw new Error('Nonce must be a Uint8Array of length 12');
        }

        const encoder = new TextEncoder();
        const encodedData = encoder.encode(data);
        const dataWithCanary = new Uint8Array(encodedData.length + this.CANARY_SIZE);
        dataWithCanary.set(encodedData);

        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            key,
            { name: 'AES-GCM' },
            false,
            ['encrypt']
        );

        return crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: nonce },
            cryptoKey,
            dataWithCanary
        );
    }

    async hash(data) {
        let arrayBuffer;

        if (data instanceof ArrayBuffer) {
            arrayBuffer = data;
        } else if (data instanceof Uint8Array) {
            arrayBuffer = data.buffer;
        } else if (typeof data === 'string') {
            const encoder = new TextEncoder();
            arrayBuffer = encoder.encode(data).buffer;
        } else {
            throw new Error('Invalid data type. Expected ArrayBuffer, Uint8Array, or string.');
        }

        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        return new Uint8Array(hashBuffer);
    }

    XOR_Buffer(key, hash) {
        if (key.length !== hash.length) {
            throw new Error('Key and hash must be of the same length');
        }

        const result = new Uint8Array(key.length);
        for (let i = 0; i < key.length; i++) {
            result[i] = key[i] ^ hash[i];
        }
        return result;
    }

    async encode_aont(data, externalKey = null) {
        const nonce = crypto.getRandomValues(new Uint8Array(12));
        const key = externalKey || await this.generateKey();

        const encryptedDt = await this.encrypt(data, key, nonce);
        const hashedData = await this.hash(encryptedDt);
        const difference = this.XOR_Buffer(key, hashedData);

        return { encryptedDt, difference, nonce };
    }

    async decode(encryptedDt, difference, nonce) {
        if (!(nonce instanceof Uint8Array) || nonce.length !== 12) {
            throw new Error('Nonce must be a Uint8Array of length 12');
        }

        const hashedDt = await this.hash(encryptedDt);
        const key = this.XOR_Buffer(difference, hashedDt);

        return this.decrypt(encryptedDt, key, nonce);
    }

    async decrypt(encryptedData, key, nonce) {
        if (!(key instanceof Uint8Array) || key.length !== this.KEY_SIZE) {
            throw new Error(`Key must be a Uint8Array of length ${this.KEY_SIZE}`);
        }
        if (!(nonce instanceof Uint8Array) || nonce.length !== 12) {
            throw new Error('Nonce must be a Uint8Array of length 12');
        }

        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            key,
            { name: 'AES-GCM' },
            false,
            ['decrypt']
        );

        const decryptedData = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: nonce },
            cryptoKey,
            encryptedData
        );

        return new Uint8Array(decryptedData);
    }
}
