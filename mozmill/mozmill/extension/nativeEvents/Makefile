define compile_rule
	libtool --mode=compile \
	$(CC) $(CFLAGS) $(CPPFLAGS) -c $<
endef
define link_rule
	libtool --mode=link \
	$(CC) $(LDFLAGS) -o $@ $^ $(LDLIBS)
endef

LIBS = libnative_events.la
libnative_events_OBJS = native_events.lo

%.lo: %.c
	$(call compile_rule)

libnative_events.la: $(libnative_events_OBJS)
	$(call link_rule)

install/%.la: %.la
	libtool --mode=install \
	install -c $(notdir $@) $(libdir)/$(notdir $@)
install: $(addprefix install/,$(LIBS))
	libtool --mode=finish $(libdir)
