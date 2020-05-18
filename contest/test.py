import sys

text = bytearray()
for line in sys.stdin:
    text += bytearray(line)

for i in range(len(text)):
    if text[i] == 0xd9 and text[i+1] == 0x45 and text[i+2] == 0x08 and \
       text[i+3] == 0xd9 and text[i+4] == 0x45 and text[i+5] == 0x08:
        text[i+3] = 0xd9
        text[i+4] = 0xeb
        text[i+5] = 0x90
        text[i+6] = 0xd8
        text[i+7] = 0xc9
        break

print text