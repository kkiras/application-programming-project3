import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Page() {
    return (
        <div>
            <h1>Tạo bài quiz</h1>
            <Tabs>
                <TabsList>
                    <TabsTrigger value="by-manual">Thủ công</TabsTrigger>
                    <TabsTrigger value="by-ai">Tự động</TabsTrigger>
                </TabsList>

                <TabsContent value="by-manual">

                </TabsContent>

                <TabsContent value="by-ai">

                </TabsContent>
            </Tabs>
        </div>


    )
}