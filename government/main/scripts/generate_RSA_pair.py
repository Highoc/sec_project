from Crypto.PublicKey import RSA

def generate_RSA_pair(bits=2048):
    new_key = RSA.generate(bits, e=65537)
    public_key = new_key.publickey().exportKey("PEM")
    private_key = new_key.exportKey("PEM")
    return private_key, public_key

def load_key_to_file(filename, key):
    with open(filename, 'wb') as file:
        file.write(key)

'''
pair = generate_RSA_pair()
print('Public RSA: {}\nPrivate RSA: {}\n'.format(pair[1], pair[0]))
'''