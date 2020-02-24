using System.Collections.Generic;
using UnityEngine;

namespace ApplySDK
{
    public class AEventCore
    {
        public delegate void ApplyEvent();
        private Dictionary<string, List<ApplyEvent>> EventPool = new Dictionary<string, List<ApplyEvent>>();

        /// <summary>
        /// 注册事件，key代表事件种类，Event代表注册的事件
        /// </summary>
        /// <param name="Key"></param>
        /// <param name="Event"></param>
        public void Inject(string Key,ApplyEvent Event)
        {
            switch (EventPool.ContainsKey(Key))
            {
                case true:
                    {
                        EventPool[Key].Add(Event);
                        break;
                    }
                case false:
                    {
                        List<ApplyEvent> AEventList = new List<ApplyEvent>();
                        AEventList.Add(Event);
                        EventPool.Add(Key, AEventList);
                        break;
                    }
            }
        }

        /// <summary>
        /// 反注册
        /// </summary>
        /// <param name="Key"></param>
        /// <param name="Event"></param>
        public void ReInject(string Key,ApplyEvent Event)
        {
            if (EventPool.ContainsKey(Key))
            {
                EventPool[Key].Remove(Event);

                if (EventPool[Key].Count == 0)
                {
                    EventPool.Remove(Key);
                }
            }
            else
            {
                Debug.LogWarning("事件池不存在：" + Key+","+Event);
            }
        }

        /// <summary>
        /// 执行Key代表的一类事件
        /// </summary>
        /// <param name="Key"></param>
        /// <param name="param"></param>
        public void RunEvent(string Key)
        {
            if (EventPool.ContainsKey(Key))
            {
                if (EventPool[Key] != null && EventPool[Key].Count > 0)
                {
                    for (int i = 0; i < EventPool[Key].Count; ++i)
                    {
                        if (EventPool[Key][i] != null)
                        {
                            EventPool[Key][i].Invoke();
                        }
                    }
                }
            }
            else
            {
                Debug.LogWarning("无法调用事件：" + Key);
            }
        }
    }
}