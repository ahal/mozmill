CC := cc
CFLAGS := -fPIC -m32
LFLAGS := -shared -m32
OBJECTS := native_events.o
TARGET := libnative_events.so

$(TARGET): $(OBJECTS)
	$(CC) $(LFLAGS) $^ -o $@
	cp $(TARGET) ../content/

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

.PHONY: clean

clean:
	echo Cleaning up temporary files
	rm -f $(TARGET) $(OBJECTS) *.o
#	mv $(TARGET) ../content/
