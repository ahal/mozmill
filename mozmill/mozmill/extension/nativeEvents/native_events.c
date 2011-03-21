#include <gdk/gdk.h>

GdkDevice* getSomeDevice() {
    GList *pList = gdk_devices_list();
    GList *currNode = pList;
    GdkDevice *currDevice = NULL;
    while (currNode != NULL && currDevice == NULL) {
        currDevice = (GdkDevice*) currNode->data;
        currNode = currNode->next;
    }

    return (GdkDevice*) g_object_ref(currDevice);
}

// This is the timestamp needed in the GDK events.
guint32 TimeSinceBootMsec() {
    struct timespec clk_tm;
    const int msec_nsec_factor = 1000000;
    const int sec_msec_factor = 1000;

    int clk_ret = clock_gettime(CLOCK_MONOTONIC, &clk_tm);
    if (clk_ret == 0) {
        return (clk_tm.tv_sec * sec_msec_factor +(clk_tm.tv_nsec / msec_nsec_factor));
    }
    return 0;
}

guint sendClick(gdouble x, gdouble y, guint _button) {
    GdkEventButton button;
    button.window = NULL;//GDK_WINDOW_ROOT;
    button.send_event = 0; // Not a synthesized event
    button.time = TimeSinceBootMsec();
    button.x = x;
    button.y = y;
    button.button = _button;
    button.device = getSomeDevice();

    GdkEvent *event = gdk_event_new(GDK_BUTTON_PRESS);
    event->button = button;

    printf("x: %f\n", event->button.x);
    printf("y: %f\n", event->button.y);

    gdk_event_put(event);
    gdk_event_free(event);

    event = gdk_event_new(GDK_BUTTON_RELEASE);
    event->button = button;

    gdk_event_put(event);
    gdk_event_free(event);

    return 0;
}

