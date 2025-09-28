import React, { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check } from 'lucide-react';
import { differenceInCalendarDays, parseISO, isToday, isFuture } from 'date-fns';

type Notification = {
  id: string; // This is the unique ID for the notification instance (e.g., orderId-15)
  name: string;
  message: string;
  daysLeft: number;
};

const Notifications = () => {
  const { individuals, families, dismissedNotificationIds, dismissNotification } = useData();

  const activeNotifications = useMemo(() => {
const today = parseISO(new Date().toISOString().split('T')[0]);
today.setHours(0, 0, 0, 0);    const notificationDays = new Set([1, 4, 7, 15]);
    const upcomingNotifications: Notification[] = [];
    const allOrders = [...individuals, ...families];
    allOrders.forEach((order) => {
      if (!order.deliveryDate) return;

const deliveryDate = parseISO(order.deliveryDate);
        if (deliveryDate < today) {
        return;
      }
 
      const daysLeft = differenceInCalendarDays(deliveryDate, today);

       if (notificationDays.has(daysLeft)) {
        const name = 'firstName' in order ? `${order.firstName} ${order.lastName}` : order.familyName;
        const uniqueId = `${order._id}-${daysLeft}`;  
        if (!dismissedNotificationIds.includes(uniqueId)) {
          upcomingNotifications.push({
            id: uniqueId,
            name: name,
            message: daysLeft === 1 ? `Order is due in 1 day.` : `Order is due in ${daysLeft} days.`,
            daysLeft: daysLeft,
          });
        }
      }
    });
    
    // Sort by soonest first
    return upcomingNotifications.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [individuals, families, dismissedNotificationIds]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary mb-2">Notifications</h1>
        <p className="text-muted-foreground">Upcoming order deadlines</p>
      </div>

      <div className="space-y-4">
        {activeNotifications.length === 0 ? (
          <Card className="shadow-card border-0 p-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-primary">All Caught Up!</h3>
              <p className="text-muted-foreground">There are no new notifications.</p>
            </div>
          </Card>
        ) : (
          activeNotifications.map((notification) => (
            <Card key={notification.id} className="shadow-card border-0">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-amber-100 text-amber-600 p-2 rounded-full">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary">{notification.name}</p>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  </div>
                </div>
                <Button size="sm" onClick={() => dismissNotification(notification.id)}>
                  OK
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;