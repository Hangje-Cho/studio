"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Brain, UploadCloud, FileJson, Clapperboard, Sparkles, RotateCw, User, Wand2 } from 'lucide-react';
import { comparePhotoToCharacters, ComparePhotoToCharactersOutput } from '@/ai/flows/compare-photo-to-characters';
import { searchCharacterInfo, SearchCharacterInfoOutput } from '@/ai/flows/search-character-info';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type Character = {
  name: string;
  description: string;
  imageDataUri: string;
};

const Loader = () => (
  <div className="flex flex-col items-center justify-center gap-4 text-center">
    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
    <p className="text-lg font-semibold text-primary font-headline">AI가 분석 중입니다...</p>
    <p className="text-muted-foreground">당신과 가장 닮은 캐릭터를 찾고 있어요. 잠시만 기다려주세요!</p>
  </div>
);

export default function Home() {
  const [characters, setCharacters] = useState<Character[] | null>(null);
  const [characterJsonString, setCharacterJsonString] = useState<string>('');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiResult, setAiResult] = useState<ComparePhotoToCharactersOutput | null>(null);
  const [characterInfo, setCharacterInfo] = useState<SearchCharacterInfoOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadCharacterData() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/characters.json');
        if (!response.ok) {
          throw new Error('캐릭터 데이터를 불러오는 데 실패했습니다. `public/characters.json` 파일이 있는지 확인해주세요.');
        }
        const text = await response.text();
        const data = JSON.parse(text);
        setCharacters(data);
        setCharacterJsonString(text);
      } catch (e: any) {
        setError(e.message);
        setCharacters(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadCharacterData();
  }, []);

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
    if (!userPhoto || !characterJsonString) {
      setError("사진을 업로드하고 캐릭터 데이터가 준비되어야 합니다.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const comparisonResult = await comparePhotoToCharacters({
        photoDataUri: userPhoto,
        characterJsonData: characterJsonString,
      });
      setAiResult(comparisonResult);

      const infoResult = await searchCharacterInfo({
        characterName: comparisonResult.characterName,
      });
      setCharacterInfo(infoResult);

    } catch (e) {
      console.error(e);
      setError('AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setAiResult(null);
      setCharacterInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUserPhoto(null);
    setAiResult(null);
    setCharacterInfo(null);
    setError(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };
  
  const renderSetupInstructions = () => (
    <Card className="w-full max-w-2xl mx-auto animate-fade-in">
      <CardHeader>
        <div className="flex items-center gap-3">
            <FileJson className="w-8 h-8 text-primary"/>
            <CardTitle className="font-headline">캐릭터 데이터 설정 안내</CardTitle>
        </div>
        <CardDescription>{error}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          앱을 사용하려면 먼저 캐릭터 데이터를 설정해야 합니다. `public` 폴더에 `character_images` 폴더를 만들고 캐릭터 이미지들을 넣어주세요. 그 다음, `public` 폴더에 `characters.json` 파일을 생성하고 아래와 같은 형식으로 캐릭터 정보를 추가해주세요.
        </p>
        <pre className="p-4 rounded-md bg-muted text-muted-foreground overflow-x-auto text-sm">
          <code>
{`[
  {
    "name": "캐릭터 이름",
    "description": "캐릭터에 대한 간단한 설명",
    "imageDataUri": "/character_images/image1.png"
  },
  {
    "name": "다른 캐릭터 이름",
    "description": "이 캐릭터에 대한 또 다른 설명",
    "imageDataUri": "/character_images/image2.png"
  }
]`}
          </code>
        </pre>
      </CardContent>
      <CardFooter>
          <p className="text-xs text-muted-foreground">파일을 추가한 후 페이지를 새로고침 해주세요.</p>
      </CardFooter>
    </Card>
  );

  const renderUploader = () => (
    <Card className="w-full max-w-md mx-auto animate-fade-in shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
          <User className="w-8 h-8 text-primary"/>
        </div>
        <CardTitle className="font-headline text-2xl mt-2">당신의 사진을 업로드하세요</CardTitle>
        <CardDescription>어떤 이탈리안 브레인롯 캐릭터와 닮았는지 AI가 분석해드립니다.</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div 
          className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer border-primary/30 hover:bg-primary/5 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {userPhoto ? (
            <div className="relative w-40 h-40 rounded-full overflow-hidden shadow-md">
              <Image src={userPhoto} alt="업로드된 사진" layout="fill" objectFit="cover" />
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
        <CardContent className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="flex flex-col items-center gap-4">
                    <h3 className="font-headline text-xl">당신의 사진</h3>
                    <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden shadow-lg border-4 border-white">
                        <Image src={userPhoto!} alt="사용자 사진" layout="fill" objectFit="cover" />
                    </div>
                </div>
                <div className="flex flex-col items-center gap-4">
                    <h3 className="font-headline text-xl">닮은 캐릭터</h3>
                    <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden shadow-lg border-4 border-white">
                        <Image src={aiResult!.characterImageDataUri} alt={aiResult!.characterName} layout="fill" objectFit="cover" data-ai-hint="portrait character"/>
                    </div>
                </div>
            </div>
            
            <Separator className="my-8" />

            <div className="space-y-6">
                <div className="p-6 bg-background rounded-lg border">
                    <h3 className="font-headline text-xl flex items-center gap-2 mb-3"><Sparkles className="text-accent w-6 h-6"/>닮은 이유 (AI 생성)</h3>
                    <p className="text-muted-foreground leading-relaxed">{aiResult?.resemblanceExplanation}</p>
                </div>
                <div className="p-6 bg-background rounded-lg border">
                    <h3 className="font-headline text-xl flex items-center gap-2 mb-3"><Clapperboard className="text-primary w-6 h-6"/>캐릭터 정보 (AI 검색)</h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{characterInfo?.characterInfo}</p>
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
            <h1 className="text-4xl font-bold font-headline">이탈리안 브레인롯 캐릭터 찾기</h1>
          </div>
          <p className="mt-2 text-lg text-muted-foreground">당신의 숨겨진 캐릭터 본능을 찾아보세요!</p>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center container mx-auto px-4 py-8">
        {isLoading ? <Loader /> : (
            !characters ? renderSetupInstructions() : (
                aiResult ? renderResults() : renderUploader()
            )
        )}
      </main>
      
      <footer className="text-center p-4 text-muted-foreground text-sm">
        <p>Firebase Studio를 사용하여 제작되었습니다.</p>
      </footer>
    </div>
  );
}
