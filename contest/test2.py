g = int(input())
if g % 4 == 0 and g % 100 != 0:
    print 'yes'
elif g % 400 == 0:
    print 'yes'
else:
    print 'no'
