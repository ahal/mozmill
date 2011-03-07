
#include <ctime>
#include <string>
#include <iostream>
#include <fstream>

#include "interactions.h"

#include "logging.h"

#include <gdk/gdk.h>
#include <gdk/gdkkeysyms.h>
#include <X11/Xlib.h>
#include <time.h>
#include <stdlib.h>
#include <assert.h>
#include <list>
#include <algorithm>
#include <functional>

#include "translate_keycode_linux.h"

using namespace std;
#define INTERACTIONS_DEBUG

#define INTERACTIONS_LOG_FILE "/tmp/native_ff_events_log"

// This is the timestamp needed in the GDK events.
guint32 MouseTimeSinceBootMsec()
{
    struct timespec clk_tm;
    const int msec_nsec_factor = 1000000;
    const int sec_msec_factor = 1000;

    int clk_ret = ::clock_gettime(CLOCK_MONOTONIC, &clk_tm);
    if (clk_ret == 0)
    {
      return (clk_tm.tv_sec * sec_msec_factor +
              (clk_tm.tv_nsec / msec_nsec_factor));
    }
    return 0;
}

// Definition of a mouse press, release events pair.
typedef std::pair<GdkEvent*, GdkEvent*> MouseEventsPair;
enum MouseEventType { bMousePress, bMouseRelease };
// This class handles generation of mouse press / release events.
// Events will be generated according to the given key to emulate
// and state of modifier keys.
class MouseEventsHandler
{
public:
  MouseEventsHandler(GdkDrawable* win_handle);
  virtual ~MouseEventsHandler();

  // Creates a series of mouse events (i.e mouse up/down)
  list<GdkEvent*> CreateEventsForMouseMove(long x, long y);
  list<GdkEvent*> CreateEventsForMouseClick(long x, long y, long button);
  list<GdkEvent*> CreateEventsForMouseDown(long x, long y, long button);
  list<GdkEvent*> CreateEventsForMouseUp(long x, long y, long button);
  // Returns the time of the latest event.
  guint32 get_last_event_time();

private:
  // Create mouse move event
  GdkEvent* CreateMouseMotionEvent(long x, long y);
  
  // Create mouse button event (up/down)
  GdkEvent* CreateMouseButtonEvent(MouseEventType ev_type, long x, long y, long button);

  // The window handle to be used.
  GdkDrawable* win_handle_;
  // Time of the most recent event created.
  guint32 last_event_time_;
};

MouseEventsHandler::MouseEventsHandler(GdkDrawable* win_handle) :
  win_handle_(win_handle), last_event_time_(MouseTimeSinceBootMsec())
{
}

guint32 MouseEventsHandler::get_last_event_time()
{
  return last_event_time_;
}


GdkEvent* MouseEventsHandler::CreateMouseMotionEvent(long x, long y)
{
    GdkEvent* p_ev = gdk_event_new(GDK_MOTION_NOTIFY);
    p_ev->motion.window = GDK_WINDOW(g_object_ref(win_handle_));
    p_ev->motion.send_event = 0; // NOT a synthesized event.
    p_ev->motion.time = MouseTimeSinceBootMsec();
    p_ev->motion.x = x;
    p_ev->motion.y = y;
	p_ev->motion.is_hint = 0;

	// Also update the latest event time
    last_event_time_ = p_ev->key.time;
    return p_ev;
}


GdkEvent* MouseEventsHandler::CreateMouseButtonEvent(MouseEventType ev_type, long x, long y, long button)
{
    GdkEventType gdk_ev = GDK_BUTTON_PRESS;
    if (ev_type == bMouseRelease) {
      gdk_ev = GDK_BUTTON_RELEASE;
    }
    GdkEvent* p_ev = gdk_event_new(gdk_ev);
    p_ev->button.window = GDK_WINDOW(g_object_ref(win_handle_));
    p_ev->button.send_event = 0; // NOT a synthesized event.
    p_ev->button.time = MouseTimeSinceBootMsec();
	p_ev->button.x = x;
	p_ev->button.y = y;
	p_ev->button.button = button;
	
	// Also update the latest event time
    last_event_time_ = p_ev->key.time;
    return p_ev;
}


list<GdkEvent*> MouseEventsHandler::CreateEventsForMouseDown(long x, long y, long button)
{
	GdkEvent* down = CreateMouseButtonEvent(bMousePress, x, y, button);
	list<GdkEvent*> ret_list;
	ret_list.push_back(down);
	return ret_list;
}


list<GdkEvent*> MouseEventsHandler::CreateEventsForMouseUp(long x, long y, long button)
{
	GdkEvent* up = CreateMouseButtonEvent(bMouseRelease, x, y, button);
	list<GdkEvent*> ret_list;
	ret_list.push_back(up);
	return ret_list;
}


list<GdkEvent*> MouseEventsHandler::CreateEventsForMouseClick(long x, long y, long button)
{
  GdkEvent* down = CreateMouseButtonEvent(bMousePress, x, y, button);
  GdkEvent* up = CreateMouseButtonEvent(bMouseRelease, x, y, button);
  MouseEventsPair ev = std::make_pair(down, up);
  list<GdkEvent*> ret_list;
  ret_list.push_back(ev.first);
  ret_list.push_back(ev.second);
  return ret_list;
}

list<GdkEvent*> MouseEventsHandler::CreateEventsForMouseMove(long x, long y)
{
	GdkEvent* move = CreateMouseMotionEvent(x, y);
	list<GdkEvent*> ret_list;
	ret_list.push_back(move);
	return ret_list;
}

MouseEventsHandler::~MouseEventsHandler()
{
}

static void sleep_for_ms(int sleep_time_ms)
{
  struct timespec sleep_time;
  sleep_time.tv_sec = sleep_time_ms / 1000;
  sleep_time.tv_nsec = (sleep_time_ms % 1000) * 1000000;
  nanosleep(&sleep_time, NULL);
}

static void submit_and_free_event(GdkEvent* p_mouse_event, int sleep_time_ms)
{
  gdk_event_put(p_mouse_event);
  gdk_event_free(p_mouse_event);
  sleep_for_ms(sleep_time_ms);
}

static void print_mouse_event(GdkEvent* p_ev)
{
  if (!((p_ev->type == GDK_BUTTON_PRESS) || (p_ev->type == GDK_BUTTON_RELEASE))) {
    LOG(DEBUG) << "Not a mouse event.";
    return;
  }

  std::string ev_type = (p_ev->type == GDK_BUTTON_PRESS ? "press" : "release");
  LOG(DEBUG) << "Type: " << ev_type <<  " time: " <<
             p_ev->key.time << " state: " << p_ev->key.state << " ";
}

static void submit_and_free_events_list(list<GdkEvent*>& events_list,
                                        int sleep_time_ms)
{
    for_each(events_list.begin(), events_list.end(), print_mouse_event);

    for_each(events_list.begin(), events_list.end(),
             bind2nd(ptr_fun(submit_and_free_event), sleep_time_ms));

    events_list.clear();
}

static bool is_gdk_mouse_event(GdkEvent* ev)
{
  return ((ev->type == GDK_BUTTON_PRESS) || (ev->type == GDK_BUTTON_RELEASE));
}

bool mouse_event_earlier_than(GdkEvent* ev, guint32 compare_time)
{
  assert(is_gdk_mouse_event(ev));
  return (ev->key.time < compare_time);
}

extern "C"
{
static guint32 gLatestEventTime = 0;


WD_RESULT clickAt(WINDOW_HANDLE windowHandle, long x, long y, long button)
{
#ifdef INTERACTIONS_DEBUG
  static bool log_initalized = false;
  if (!log_initalized) {
    LOG::Level("DEBUG");
    LOG::File(INTERACTIONS_LOG_FILE, "a");
    log_initalized = true;
  }
#endif

  const int timePerEvent = 10 /* ms */;

  LOG(DEBUG) << "---------- starting clickAt: " << windowHandle <<  "---------";
  GdkDrawable* hwnd = (GdkDrawable*) windowHandle;

  MouseEventsHandler mousep_handler(hwnd);

  struct timespec sleep_time;
  sleep_time.tv_sec = timePerEvent / 1000;
  sleep_time.tv_nsec = (timePerEvent % 1000) * 1000000;
  LOG(DEBUG) << "Sleep time is " << sleep_time.tv_sec << " seconds and " <<
            sleep_time.tv_nsec << " nanoseconds.";

  list<GdkEvent*> events_for_mouse = mousep_handler.CreateEventsForMouseClick(x, y, button);
  submit_and_free_events_list(events_for_mouse, timePerEvent);


  if (gLatestEventTime < mousep_handler.get_last_event_time()) {
    gLatestEventTime = mousep_handler.get_last_event_time();
  }

  LOG(DEBUG) << "---------- Ending clickAt ----------";
  return 0;
}

/**
 * mouseMoveTo
 */
WD_RESULT mouseMoveTo(WINDOW_HANDLE windowHandle, long duration, long fromX, long fromY, long toX, long toY)
{
#ifdef INTERACTIONS_DEBUG
  static bool log_initalized = false;
  if (!log_initalized) {
    LOG::Level("DEBUG");
    LOG::File(INTERACTIONS_LOG_FILE, "a");
    log_initalized = true;
  }
#endif

  const int timePerEvent = 10 /* ms */;

  LOG(DEBUG) << "---------- starting mouseMoveTo: " << windowHandle <<  "---------";
  GdkDrawable* hwnd = (GdkDrawable*) windowHandle;

  MouseEventsHandler mousep_handler(hwnd);

  int steps = 15;
  int sleep = steps / duration;
  
  for (int i = 0; i < steps; ++i) {
	//To avoid integer division rounding and cumulative floating point errors,
	//calculate from scratch each time
    int currentX = fromX + ((toX - fromX) * ((double)i) / steps);
	int currentY = fromY + ((toY - fromY) * ((double)i) / steps);
    list<GdkEvent*> events_for_mouse = mousep_handler.CreateEventsForMouseMove(currentX, currentY);
    submit_and_free_events_list(events_for_mouse, timePerEvent);
    sleep_for_ms(sleep);
  }



  if (gLatestEventTime < mousep_handler.get_last_event_time()) {
    gLatestEventTime = mousep_handler.get_last_event_time();
  }

  LOG(DEBUG) << "---------- Ending clickAt ----------";
  return 0;
}

/**
 * mouseDownAt
 */
WD_RESULT mouseDownAt(WINDOW_HANDLE windowHandle, long x, long y, long button)
{
#ifdef INTERACTIONS_DEBUG
  static bool log_initalized = false;
  if (!log_initalized) {
    LOG::Level("DEBUG");
    LOG::File(INTERACTIONS_LOG_FILE, "a");
    log_initalized = true;
  }
#endif

  const int timePerEvent = 10 /* ms */;

  LOG(DEBUG) << "---------- starting clickAt: " << windowHandle <<  "---------";
  GdkDrawable* hwnd = (GdkDrawable*) windowHandle;

  MouseEventsHandler mousep_handler(hwnd);

  struct timespec sleep_time;
  sleep_time.tv_sec = timePerEvent / 1000;
  sleep_time.tv_nsec = (timePerEvent % 1000) * 1000000;
  LOG(DEBUG) << "Sleep time is " << sleep_time.tv_sec << " seconds and " <<
            sleep_time.tv_nsec << " nanoseconds.";

  list<GdkEvent*> events_for_mouse = mousep_handler.CreateEventsForMouseDown(x, y, button);
  submit_and_free_events_list(events_for_mouse, timePerEvent);


  if (gLatestEventTime < mousep_handler.get_last_event_time()) {
    gLatestEventTime = mousep_handler.get_last_event_time();
  }

  LOG(DEBUG) << "---------- Ending clickAt ----------";
  return 0;
}

/**
 * mouseUpAt
 */
WD_RESULT mouseUpAt(WINDOW_HANDLE windowHandle, long x, long y, long button)
{
  #ifdef INTERACTIONS_DEBUG
  static bool log_initalized = false;
  if (!log_initalized) {
    LOG::Level("DEBUG");
    LOG::File(INTERACTIONS_LOG_FILE, "a");
    log_initalized = true;
  }
#endif

  const int timePerEvent = 10 /* ms */;

  LOG(DEBUG) << "---------- starting clickAt: " << windowHandle <<  "---------";
  GdkDrawable* hwnd = (GdkDrawable*) windowHandle;

  MouseEventsHandler mousep_handler(hwnd);

  struct timespec sleep_time;
  sleep_time.tv_sec = timePerEvent / 1000;
  sleep_time.tv_nsec = (timePerEvent % 1000) * 1000000;
  LOG(DEBUG) << "Sleep time is " << sleep_time.tv_sec << " seconds and " <<
            sleep_time.tv_nsec << " nanoseconds.";

  list<GdkEvent*> events_for_mouse = mousep_handler.CreateEventsForMouseUp(x, y, button);
  submit_and_free_events_list(events_for_mouse, timePerEvent);


  if (gLatestEventTime < mousep_handler.get_last_event_time()) {
    gLatestEventTime = mousep_handler.get_last_event_time();
  }

  LOG(DEBUG) << "---------- Ending clickAt ----------";
  return 0;
}


}

#undef INTERACTIONS_LOG_FILE

