with open('victim', 'rb') as file:
    content = bytearray(file.read())
    for i in range(len(content)):
        if content[i] == 0x75 and content[i+1] == 0x11:
            content[i] = 0x74
            break
    with open('cracked', 'wb') as o_file:
        o_file.write(content)
