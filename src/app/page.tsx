"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Brain, UploadCloud, RotateCw, User, Wand2 } from 'lucide-react';
import { comparePhotoToCharacters, ComparePhotoToCharactersOutput } from '@/ai/flows/compare-photo-to-characters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import charactersData from '@/lib/characters.json';

export type Character = {
  id: string;
  name: string;
  description: string;
  imageDataUri: string;
};
const characters: Character[] = charactersData;

type DisplayResult = {
  characterName: string;
  characterImageDataUri: string;
};

const Loader = () => (
  <div className="flex flex-col items-center justify-center gap-4 text-center">
    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
    <p className="text-lg font-semibold text-primary font-headline">AI가 분석 중입니다...</p>
    <p className="text-muted-foreground">당신과 가장 닮은 캐릭터를 찾고 있어요. 잠시만 기다려주세요!</p>
  </div>
);

export default function Home() {
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<DisplayResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompare = async () => {
    if (!userPhoto) {
      toast({
          variant: "destructive",
          title: "오류",
          description: "사진을 먼저 업로드해주세요.",
      });
      return;
    }
    setIsLoading(true);
    setAiResult(null);

    try {
      const shuffledCharacters = [...characters].sort(() => 0.5 - Math.random());
      const characterBatch = shuffledCharacters.slice(0, 8);

      const charactersForAiPromises = characterBatch.map(async (c) => {
        try {
          const response = await fetch(c.imageDataUri);
          if (!response.ok) {
            console.error(`Failed to fetch image for ${c.name}: ${response.statusText}`);
            return null;
          }
          const blob = await response.blob();
          const dataUri = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          return { id: c.id, name: c.name, description: c.description, imageDataUri: dataUri };
        } catch (error) {
          console.error(`Error processing image for ${c.name}:`, error);
          return null;
        }
      });
      
      const charactersForAi = (await Promise.all(charactersForAiPromises)).filter(Boolean) as (Character & { imageDataUri: string; })[];

      if (charactersForAi.length === 0) {
        throw new Error("캐릭터 이미지를 불러오지 못했습니다. 네트워크를 확인하거나 잠시 후 다시 시도해주세요.");
      }

      const comparisonResult: ComparePhotoToCharactersOutput = await comparePhotoToCharacters({
        photoDataUri: userPhoto,
        characterData: charactersForAi,
      });

      if (!comparisonResult.results || comparisonResult.results.length === 0) {
        throw new Error("AI가 분석 결과를 반환하지 않았습니다.");
      }
      
      const characterMap = new Map(charactersForAi.map(c => [c.id, c]));

      const combinedResults = comparisonResult.results.map(result => {
        const character = characterMap.get(result.id);
        if (!character) {
          console.warn(`AI returned an unknown characterId: ${result.id}`);
          return null;
        }
        return {
          ...character,
          score: result.resemblanceScore,
        };
      }).filter(Boolean) as (Character & { score: number })[];
      
      if (combinedResults.length === 0) {
        throw new Error("AI 분석 결과와 캐릭터 정보를 매칭하는데 실패했습니다.");
      }
      
      combinedResults.sort((a, b) => b.score - a.score);

      const topMatches = combinedResults.slice(0, 5);
      const selectedMatch = topMatches[Math.floor(Math.random() * topMatches.length)];

      const resultForDisplay: DisplayResult = {
        characterName: selectedMatch.name,
        characterImageDataUri: selectedMatch.imageDataUri,
      };

      setAiResult(resultForDisplay);

    } catch (e: any) {
      console.error(e);
      toast({
          variant: "destructive",
          title: "AI 분석 오류",
          description: e.message || "AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      });
      setAiResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUserPhoto(null);
    setAiResult(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const renderUploader = () => (
    <Card className="w-full max-w-md mx-auto animate-fade-in shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
          <User className="w-8 h-8 text-primary"/>
        </div>
        <CardTitle className="font-headline text-2xl mt-2">당신의 사진을 업로드하세요</CardTitle>
        <CardDescription>어떤 캐릭터와 닮았는지 AI가 분석해드립니다.</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div 
          className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer border-primary/30 hover:bg-primary/5 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {userPhoto ? (
            <div className="relative w-40 h-40 rounded-full overflow-hidden shadow-md">
              <Image src={userPhoto} alt="업로드된 사진" fill style={{ objectFit: 'cover' }} />
            </div>
          ) : (
            <div className="text-center">
              <UploadCloud className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="mt-4 text-lg font-semibold">클릭하여 사진 업로드</p>
              <p className="text-sm text-muted-foreground">또는 파일을 여기로 드래그하세요</p>
            </div>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </CardContent>
      <CardFooter>
        <Button onClick={handleCompare} disabled={!userPhoto || isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-base py-6">
          <Wand2 className="mr-2 h-5 w-5"/>
          결과 확인하기
        </Button>
      </CardFooter>
    </Card>
  );

  const renderResults = () => (
    <div className="animate-fade-in">
       <Card className="w-full max-w-4xl mx-auto shadow-xl overflow-hidden">
        <CardHeader className="bg-primary/5 p-6">
          <div className="text-center">
            <Badge variant="secondary" className="bg-accent text-accent-foreground">AI 분석 결과</Badge>
            <h2 className="font-headline text-3xl mt-2">당신은 <span className="text-primary">{aiResult?.characterName}</span> 입니다!</h2>
          </div>
        </CardHeader>
        <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="flex flex-col items-center gap-4">
                    <h3 className="font-headline text-xl">당신의 사진</h3>
                    <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden shadow-lg border-4 border-white">
                        <Image src={userPhoto!} alt="사용자 사진" fill style={{ objectFit: 'cover' }} />
                    </div>
                </div>
                <div className="flex flex-col items-center gap-4">
                    <h3 className="font-headline text-xl">닮은 캐릭터</h3>
                    <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden shadow-lg border-4 border-white">
                        <Image 
                          src={aiResult!.characterImageDataUri} 
                          alt={aiResult!.characterName} 
                          fill 
                          style={{ objectFit: 'cover' }} 
                          data-ai-hint="portrait character"
                          onError={() => {
                            if (aiResult?.characterImageDataUri !== '/placeholder.svg') {
                              setAiResult(prev => prev ? ({ ...prev, characterImageDataUri: '/placeholder.svg' }) : null);
                            }
                          }}
                        />
                    </div>
                </div>
            </div>
        </CardContent>
        <CardFooter className="p-6 bg-muted/50">
             <Button onClick={handleReset} className="w-full md:w-auto mx-auto" variant="outline">
                <RotateCw className="mr-2 h-4 w-4" />
                다시 시도하기
            </Button>
        </CardFooter>
       </Card>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="py-6">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3">
            <Brain className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold font-headline">닮은꼴 캐릭터 찾기</h1>
          </div>
          <p className="mt-2 text-lg text-muted-foreground">AI가 당신과 닮은 캐릭터를 찾아드립니다!</p>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center container mx-auto px-4 py-8">
        {isLoading ? <Loader /> : (
            aiResult ? renderResults() : renderUploader()
        )}
      </main>
      
      <footer className="text-center p-4 text-muted-foreground text-sm">
        <p>Firebase Studio를 사용하여 제작되었습니다.</p>
      </footer>
    </div>
  );
}
