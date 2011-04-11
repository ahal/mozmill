#include "native_events.h"
#include <stdlib.h>

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

extern "C" guint click(gint x, gint y, guint button) {
    GdkScreen *screen = gdk_screen_get_default();               // Get default screen
    GdkWindow *top = gdk_screen_get_active_window(screen);      // Get active gdk window (assume it is Firefox)
    
    // Firefox creates a child window, get it
    GList *list1 = gdk_window_get_children(top);
    GdkWindow *parent = (GdkWindow*)list1->data;
    // Another child is created inside the first child, also get it
    GList *list2 = gdk_window_get_children(parent);
    GdkWindow *window = (GdkWindow*)list2->data;

    printf("window: %p\n", window);
    printf("window type: %d\n", gdk_window_get_window_type(window));

    GdkDevice *device = getSomeDevice();


    GdkEvent *press = gdk_event_new(GDK_BUTTON_PRESS);
    press->button.window = window;
    press->button.send_event = false; // Not a synthesized event
    press->button.time = TimeSinceBootMsec();
    press->button.x = x ;
    press->button.y = y ;
    press->button.button = button;
    press->button.device = device;

    printf("x: %f\n", press->button.x);
    printf("y: %f\n", press->button.y);

    gdk_event_put(press);
    
    GdkEvent *release = gdk_event_copy(press);
    release->button.type = GDK_BUTTON_RELEASE;
    release->button.time++;

    gdk_event_put(release);
    
    // Cleanup
    g_object_unref(top);
    g_object_unref(device);
    g_list_free(list1);
    g_list_free(list2);
    gdk_event_free(release); // Only free this event because it was copied from the first one

    return true;
}

